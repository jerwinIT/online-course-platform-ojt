// File: types/auth.ts

// Authentication Types

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

export interface RegisterRequest {
  name?: string;
  email: string;
  password?: string;
  provider?: 'google';
  providerAccountId?: string;
  accessToken?: string;
  idToken?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  provider?: 'google';
  providerAccountId?: string;
  accessToken?: string;
  idToken?: string;
}

export interface LinkGoogleRequest {
  providerAccountId: string;
  accessToken?: string;
  idToken?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user: User;
  linked?: boolean;
}

export interface ErrorResponse {
  error: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface GoogleUserInfo {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token?: string;
  refresh_token?: string;
}