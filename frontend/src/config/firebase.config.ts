/**
 * Firebase Configuration
 * Setup Firebase for Google and Facebook authentication
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  type User as FirebaseUser
} from 'firebase/auth';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC...",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure providers
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    console.error('Google sign in error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
    throw {
      error: 'google_signin_failed',
      message: errorMessage
    };
  }
};

/**
 * Sign in with Facebook
 */
export const signInWithFacebook = async (): Promise<FirebaseUser> => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    return result.user;
  } catch (error: unknown) {
    console.error('Facebook sign in error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Facebook';
    throw {
      error: 'facebook_signin_failed',
      message: errorMessage
    };
  }
};

/**
 * Sign in with Google (Redirect method - for mobile)
 */
export const signInWithGoogleRedirect = async (): Promise<void> => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: unknown) {
    console.error('Google redirect sign in error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to redirect to Google sign in';
    throw {
      error: 'google_redirect_failed',
      message: errorMessage
    };
  }
};

/**
 * Sign in with Facebook (Redirect method - for mobile)
 */
export const signInWithFacebookRedirect = async (): Promise<void> => {
  try {
    await signInWithRedirect(auth, facebookProvider);
  } catch (error: unknown) {
    console.error('Facebook redirect sign in error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to redirect to Facebook sign in';
    throw {
      error: 'facebook_redirect_failed',
      message: errorMessage
    };
  }
};

/**
 * Get redirect result after OAuth redirect
 */
export const handleRedirectResult = async (): Promise<FirebaseUser | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error: unknown) {
    console.error('Redirect result error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get redirect result';
    throw {
      error: 'redirect_result_failed',
      message: errorMessage
    };
  }
};

/**
 * Sign out from Firebase
 */
export const firebaseSignOutUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: unknown) {
    console.error('Firebase sign out error:', error);
    throw error;
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentFirebaseUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

export { auth };
export type { FirebaseUser };
