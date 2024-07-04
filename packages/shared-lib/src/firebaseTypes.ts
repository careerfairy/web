/**
 * During compilation we have access to the client sdk
 *
 * We use the compat paths because they're the most used atm in
 * our codebase. We should remove the compat path after migrating all
 * the code instances to the firebase v9 types
 */
import type firebase from "firebase/compat/app"

/**
 * Utility function for each package to convert JS Dates
 * into firestore Timestamp objects
 *
 * Each package should provide the fromDate fn for their flavour
 * firebase-admin, firebase/compat, etc
 */
export const fromDateConverter = (
   date: Date | number,
   fromDateFn: fromDateFirestoreFn
): firebase.firestore.Timestamp => {
   if (!date) return null

   return fromDateFn(new Date(date))
}

/**
 * Utility type so that packages can provide a function
 * using their firebase sdk fromDate fn
 */
export type fromDateFirestoreFn = (date: Date) => firebase.firestore.Timestamp

/**
 * Convert a potentially firestore Timestamp to a JS Date
 */
export const toDate = (
   timestamp: Date | firebase.firestore.Timestamp
): Date | null => {
   if (!timestamp) return null

   if (timestamp instanceof Date) {
      return timestamp
   }

   return timestamp.toDate?.() || null
}

/**
 * Consolidate the firebase types required by this lib
 * on this file
 *
 * Will help if we need to change the firebase flavour / compat version
 */
export type Timestamp = firebase.firestore.Timestamp
export type DocumentData = firebase.firestore.DocumentData
export type DocumentSnapshot = firebase.firestore.DocumentSnapshot
export type FieldValue = firebase.firestore.FieldValue
export type DocumentReference = firebase.firestore.DocumentReference
