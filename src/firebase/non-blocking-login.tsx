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
  type UserCredential
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up. 
 * Note: Returns promise for cases where immediate access to user object is needed for profile creation.
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly.
  signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in via redirect (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  // Using redirect for better compatibility with in-app browsers (TikTok/Instagram)
  signInWithRedirect(authInstance, provider);
}

/** Handles the result of a Google redirect sign-in. */
export async function handleGoogleRedirectResult(authInstance: Auth): Promise<UserCredential | null> {
  return getRedirectResult(authInstance);
}

/** Configures Auth persistence for session stability across reloads. */
export function configureAuthPersistence(authInstance: Auth): void {
  setPersistence(authInstance, browserLocalPersistence);
}
