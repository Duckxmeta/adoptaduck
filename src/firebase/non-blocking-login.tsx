'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  UserCredential,
} from 'firebase/auth';

/** Configure browser persistence (non-blocking). */
export function configureAuthPersistence(authInstance: Auth): Promise<void> {
  return setPersistence(authInstance, browserLocalPersistence);
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google Sign-in via Redirect. Mobile browsers handle this much better than popups. */
export function initiateGoogleSignIn(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  
  /** 
   * Force 'select_account' to ensure users can choose the specific email 
   * added to the Google Cloud Console Test Users list. 
   */
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  
  return signInWithRedirect(authInstance, provider);
}

/** Handle the result of a Google Redirect sign-in. */
export function handleGoogleRedirectResult(authInstance: Auth): Promise<UserCredential | null> {
  return getRedirectResult(authInstance);
}
