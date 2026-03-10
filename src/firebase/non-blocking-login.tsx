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
  browserLocalPersistence
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in with redirect (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  // Force account selection to help with Testing Mode 403 errors
  provider.setCustomParameters({ prompt: 'select_account' });
  signInWithRedirect(authInstance, provider);
}

/** Handle the result of a Google sign-in redirect. */
export async function handleGoogleRedirectResult(authInstance: Auth) {
  try {
    return await getRedirectResult(authInstance);
  } catch (error) {
    throw error;
  }
}

/** Configure authentication persistence for stable sessions. */
export function configureAuthPersistence(authInstance: Auth): void {
  setPersistence(authInstance, browserLocalPersistence).catch((error) => {
    console.error("Auth Persistence Error:", error);
  });
}
