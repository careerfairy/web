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
         // check if array
         if (
            Array.isArray(this[key]) &&
            this[key].length > 0 &&
            this[key][0] instanceof BaseModel
         ) {
            // check if array of objects
            serialized[key] = this[key].map((item) =>
               item.serializeToPlainObject()
            )
            continue
         }
         if (this[key] instanceof BaseModel) {
            serialized[key] = this[key].serializeToPlainObject()
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
 * Map models if we receive an object
 * otherwise it should be an id, and we should return null
 * @param targetField
 * @param creationFunction
 */
export function saveIfObject<T>(
   targetField: object | string,
   creationFunction: (field: any) => T
) {
   if (
      targetField &&
      typeof targetField === "object" &&
      Object.keys(targetField).length
   ) {
      try {
         return creationFunction(targetField)
      } catch (e) {
         // if for some reason the model fails creating, return null as if it doesn't exist
         console.error(e, targetField)
         return null
      }
   } else {
      return null
   }
}

/**
 * Map list of models to a string[] or object[]
 *
 * Some relationships are shallow, returning the object id instead of the object
 * with all properties
 * @param targetField
 * @param creationFunction
 */
export function mapIfObject<T extends BaseModel>(
   targetField: any[],
   creationFunction: (field: any) => any
) {
   if (!targetField) return []
   return targetField
      .map((o) => saveIfObject<T>(o, creationFunction))
      .filter((o) => o) as T[]
}

/**
 * Convert a serialized date object to Date
 *
 * This method should convert back the number of milliseconds to Date
 * We also accept a Date type to have type support in the createFromPlainObject methods
 * @param date
 */
export function fromSerializedDate(date?: number | Date): Date {
   if (date instanceof Date) {
      return date
   }

   return date ? new Date(date) : null
}
