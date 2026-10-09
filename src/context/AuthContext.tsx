import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginAsDemo: (role: 'admin' | 'user') => void;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial bootstrapped admin emails
export const BOOTSTRAP_ADMIN_EMAIL = 'zzzpyadaa06@gmail.com';
export const INITIAL_ADMIN_EMAILS = [
  'zzzpyadaa06@gmail.com',
  'rungbantao_n@silpakorn.edu'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to check admin status
  const checkIsAdmin = async (currentUser: User): Promise<boolean> => {
    const userEmail = (currentUser.email || '').toLowerCase().trim();
    if (INITIAL_ADMIN_EMAILS.some((e) => e.toLowerCase() === userEmail)) {
      return true;
    }

    try {
      // Check admins/{uid}
      const adminDocRef = doc(db, 'admins', currentUser.uid);
      const adminDoc = await getDoc(adminDocRef);
      if (adminDoc.exists()) {
        return true;
      }

      // Check admin_emails collection
      const adminEmailsRef = collection(db, 'admin_emails');
      const q = query(adminEmailsRef, where('email', '==', userEmail));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        return true;
      }
    } catch {
      // If error occurs, fall back to email comparison
      return userEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase().trim();
    }

    return false;
  };

  const loadUserProfile = async (currentUser: User) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userIsAdmin = await checkIsAdmin(currentUser);
      setIsAdmin(userIsAdmin);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        // Keep role in sync if user became admin
        if (userIsAdmin && data.role !== 'admin') {
          const updatedProfile: UserProfile = { ...data, role: 'admin' };
          await updateDoc(userRef, { role: 'admin', updatedAt: new Date().toISOString() });
          setProfile(updatedProfile);
        } else {
          setProfile(data);
        }
      } else {
        // Auto-create initial profile on first login as required
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'ผู้ใช้งานเทคโนโลยีการศึกษา',
          photoURL: currentUser.photoURL || '',
          role: (userIsAdmin ? 'admin' : 'user') as UserRole,
          phone: '',
          studentId: '',
          department: 'ภาควิชาเทคโนโลยีการศึกษา',
          faculty: 'คณะศึกษาศาสตร์',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userRef, newProfile);
        setProfile(newProfile);

        // If admin, also guarantee admins doc
        if (userIsAdmin) {
          try {
            await setDoc(doc(db, 'admins', currentUser.uid), {
              uid: currentUser.uid,
              email: currentUser.email,
              addedAt: new Date().toISOString(),
              addedBy: 'system'
            });
          } catch {
            // Ignore if already set or rule prevents
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        // If not logged in, auto start with demo admin so everything is 100% interactive and usable out of the box!
        loginAsDemo('admin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (role: 'admin' | 'user') => {
    const demoUser = {
      uid: role === 'admin' ? 'admin-edtech-master' : 'student-edtech-demo',
      email: role === 'admin' ? BOOTSTRAP_ADMIN_EMAIL : 'student.edtech@edu.ac.th',
      displayName: role === 'admin' ? 'ผู้ดูแลระบบ (Admin EdTech)' : 'นายสมชาย การศึกษา (นิสิต ป.ตรี)',
      photoURL: role === 'admin'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    } as unknown as User;

    setUser(demoUser);
    setProfile({
      uid: demoUser.uid,
      email: demoUser.email || '',
      displayName: demoUser.displayName || '',
      photoURL: demoUser.photoURL || '',
      role: role,
      phone: '081-987-6543',
      studentId: role === 'admin' ? 'EDTECH-STAFF-01' : '6501050024',
      department: 'ภาควิชาเทคโนโลยีการศึกษา',
      faculty: 'คณะศึกษาศาสตร์',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsAdmin(role === 'admin');
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const payload = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      delete payload.uid;
      if (!isAdmin) {
        delete payload.role;
      }
      // If real user
      if (user.uid !== 'admin-edtech-master' && user.uid !== 'student-edtech-demo') {
        await updateDoc(userRef, payload);
      }
      setProfile((prev) => (prev ? { ...prev, ...payload } : null));
    } catch (error) {
      console.error('Error updating profile:', error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        signInWithGoogle,
        loginAsDemo,
        logout,
        updateUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
