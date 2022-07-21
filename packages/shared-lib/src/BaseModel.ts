export abstract class BaseModel {
   /**
    * Convert from a class object to plain object with primitive types
    * Useful to return as JSON responses from the backend
    *
    * Don't forget to convert it again to a class type (createFromPlainObject)
    * otherwise functions won't be accessible
    */
   serializeToPlainObject() {
      return this
   }
}
