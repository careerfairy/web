/**
 * Shared logic for all Model entities
 *
 * Models should implement the following static methods (if needed):
 *  (static methods can't be enforced via interface or be abstract :/)
 *
 * static createFromMerge(mergeObject)
 *  Converts a Merge Response Object into the model class instance
 *  Mostly used by the MergeRepository
 *
 * static createFromPlainObject(plainObject)
 *  Convert from plain objects (json/object) into class instance
 *  Mostly used when parsing a backend response (cloud function)
 *  When these models are served as HTTP responses they are serialized
 * using JSON.stringify() implicitly (cloud functions)
 *
 *  We use class instances to allow support for custom methods
 *  via object prototypes, this allows the objects to handle business logic
 */
export abstract class BaseModel {
   /**
    * Serialize this object into a plain object
    * Objects should be serialized before being sent as an HTTP response
    *
    * Custom logic to serialize certain types:
    *   Date -> number (milliseconds since epoch)
    *
    * onCall Firebase Functions serialization only support basic types
    * https://firebase.google.com/docs/functions/callable-reference#serialization
    */
   serializeToPlainObject() {
      const serialized: { [field: string]: any } = {}

      for (const key of Object.keys(this)) {
         // serialize Date
         if (this[key] instanceof Date) {
            serialized[key] = (this[key] as unknown as Date).getTime()
            continue
         }

         serialized[key] = this[key]
      }

      return serialized
   }
}

/*
|--------------------------------------------------------------------------
| Utilities
|--------------------------------------------------------------------------
*/
/**
 * Convert a Merge date string to Date object
 *
 * @param dateString
 */
export function fromMergeDate(dateString?: string): Date {
   return dateString ? new Date(dateString) : null
}

/**
 * Convert a serialized date object to Date
 *
 * This method should convert back the number of milliseconds to Date
 * We also accept a Date type to have type support in the createFromPlainObject methods
 * @param date
 */
export function fromSerializedDate(date?: number | Date): Date {
   if (date && date instanceof Date) {
      return date
   }

   return date ? new Date(date) : null
}
