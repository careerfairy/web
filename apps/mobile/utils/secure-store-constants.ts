export const SECURE_STORE_KEYS = {
   AUTH_TOKEN: "authToken",
   USER_ID: "userId",
   USER_PASSWORD: "userPassword",
   EXPO_PUSH_TOKEN: "pushToken",
   CUSTOMERIO_PUSH_TOKEN: "customerioPushToken",
} as const

// Type for the keys to ensure type safety
export type SecureStoreKeys = keyof typeof SECURE_STORE_KEYS
