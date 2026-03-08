import type { ApiError } from "@/api/client";

/**
 * Maps API error messages to user-friendly error messages for authentication flows.
 */

// Common error message patterns from the backend
const ERROR_PATTERNS = {
  // Sign in errors
  invalidCredentials: ["invalid credentials", "invalid email or password", "incorrect password", "wrong password", "user not found", "no user found"],
  accountLocked: ["account locked", "account disabled", "account suspended"],
  tooManyAttempts: ["too many", "rate limit", "try again later", "locked out"],

  // Sign up errors
  emailExists: ["email already", "email taken", "user already exists", "duplicate email"],
  phoneExists: ["phone already", "phone taken", "duplicate phone"],
  invalidEmail: ["invalid email", "email format"],
  weakPassword: ["weak password", "password too short", "password requirements", "password must"],
  invalidPhone: ["invalid phone", "phone format"],

  // Password reset errors
  invalidToken: ["invalid token", "token expired", "expired token", "token not found", "invalid reset"],
  tokenUsed: ["token used", "already used"],

  // Network/server errors
  networkError: ["network", "timeout", "connection", "econnrefused", "enotfound"],
  serverError: ["internal server", "500", "something went wrong"],
} as const;

// User-friendly error messages
const FRIENDLY_MESSAGES = {
  // Sign in
  invalidCredentials: "The email or password you entered is incorrect. Please try again.",
  accountLocked: "Your account has been temporarily locked. Please contact support if this persists.",
  tooManyAttempts: "Too many sign-in attempts. Please wait a few minutes and try again.",

  // Sign up
  emailExists: "An account with this email already exists. Try signing in instead.",
  phoneExists: "This phone number is already registered. Try a different number.",
  invalidEmail: "Please enter a valid email address.",
  weakPassword: "Please choose a stronger password with at least 8 characters, including letters and numbers.",
  invalidPhone: "Please enter a valid 10-digit Indian phone number.",

  // Password reset
  invalidToken: "This reset link has expired or is invalid. Please request a new one.",
  tokenUsed: "This reset link has already been used. Please request a new one if needed.",

  // Generic
  networkError: "Unable to connect. Please check your internet connection and try again.",
  serverError: "Something went wrong on our end. Please try again in a moment.",
  unknown: "An unexpected error occurred. Please try again.",
} as const;

/**
 * Checks if a string matches any of the patterns (case-insensitive)
 */
function matchesPatterns(message: string, patterns: readonly string[]): boolean {
  const lowerMessage = message.toLowerCase();
  return patterns.some(pattern => lowerMessage.includes(pattern));
}

/**
 * Formats an authentication error into a user-friendly message.
 *
 * @param error - The error object from the API or mutation
 * @param context - The auth context (signin, signup, forgot-password, reset-password)
 * @returns A user-friendly error message
 */
export function formatAuthError(
  error: Error | ApiError | unknown,
  context: "signin" | "signup" | "forgot-password" | "reset-password"
): string {
  // Extract message from error
  const errorMessage = error instanceof Error
    ? error.message
    : (error as ApiError)?.message ?? "";

  const statusCode = (error as ApiError)?.statusCode ?? 0;

  // Handle network errors (no response)
  if (matchesPatterns(errorMessage, ERROR_PATTERNS.networkError) || statusCode === 0) {
    return FRIENDLY_MESSAGES.networkError;
  }

  // Handle server errors
  if (statusCode >= 500 || matchesPatterns(errorMessage, ERROR_PATTERNS.serverError)) {
    return FRIENDLY_MESSAGES.serverError;
  }

  // Context-specific error mapping
  switch (context) {
    case "signin": {
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.invalidCredentials)) {
        return FRIENDLY_MESSAGES.invalidCredentials;
      }
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.accountLocked)) {
        return FRIENDLY_MESSAGES.accountLocked;
      }
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.tooManyAttempts)) {
        return FRIENDLY_MESSAGES.tooManyAttempts;
      }
      break;
    }

    case "signup": {
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.emailExists)) {
        return FRIENDLY_MESSAGES.emailExists;
      }
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.phoneExists)) {
        return FRIENDLY_MESSAGES.phoneExists;
      }
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.invalidEmail)) {
        return FRIENDLY_MESSAGES.invalidEmail;
      }
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.weakPassword)) {
        return FRIENDLY_MESSAGES.weakPassword;
      }
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.invalidPhone)) {
        return FRIENDLY_MESSAGES.invalidPhone;
      }
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.tooManyAttempts)) {
        return FRIENDLY_MESSAGES.tooManyAttempts;
      }
      break;
    }

    case "forgot-password": {
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.tooManyAttempts)) {
        return "Too many reset requests. Please wait before requesting another link.";
      }
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.invalidEmail)) {
        return FRIENDLY_MESSAGES.invalidEmail;
      }
      // For forgot password, we don't reveal if email exists or not
      // So network/server errors are the main concern
      break;
    }

    case "reset-password": {
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.invalidToken)) {
        return FRIENDLY_MESSAGES.invalidToken;
      }
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.tokenUsed)) {
        return FRIENDLY_MESSAGES.tokenUsed;
      }
      if (matchesPatterns(errorMessage, ERROR_PATTERNS.weakPassword)) {
        return FRIENDLY_MESSAGES.weakPassword;
      }
      break;
    }
  }

  // If we have a specific error message from the API and it's reasonable, use it
  if (errorMessage && errorMessage.length < 150) {
    return errorMessage;
  }

  return FRIENDLY_MESSAGES.unknown;
}

/**
 * Gets the appropriate error title for an auth context
 */
export function getAuthErrorTitle(context: "signin" | "signup" | "forgot-password" | "reset-password"): string {
  switch (context) {
    case "signin":
      return "Sign in failed";
    case "signup":
      return "Could not create account";
    case "forgot-password":
      return "Could not send reset link";
    case "reset-password":
      return "Could not reset password";
  }
}
