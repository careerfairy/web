export const SECURE_STORE_KEYS = {
   FIREBASE_ID_TOKEN: "firebaseIdToken",
   EXPO_PUSH_TOKEN: "pushToken",
   CUSTOMERIO_PUSH_TOKEN: "customerioPushToken",
} as const

// Type for the keys to ensure type safety
export type SecureStoreKeys = keyof typeof SECURE_STORE_KEYS
