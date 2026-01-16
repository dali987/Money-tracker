import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth React client for the money tracker application.
 *
 * This client provides hooks and methods for authentication:
 * - useSession: Hook to get current session state
 * - signIn: Methods to sign in (email, social providers)
 * - signUp: Methods to create new accounts
 * - signOut: Method to sign out
 *
 * The client automatically handles:
 * - Session cookies
 * - Token refresh
 * - Session caching
 */
export const authClient = createAuthClient({
    /**
     * Base URL of the auth server.
     * In development, this is the local server.
     * In production, this should be the API domain.
     */
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// Export individual methods for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

/**
 * Type definitions for auth responses.
 * These help with TypeScript type inference.
 */
export type Session = typeof authClient.$Infer.Session;
export type User = Session['user'];
