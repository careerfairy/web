import { FieldValue } from "../../api/firestoreAdmin"

export type OperationsToMake = {
   // The operations to make to the nested properties on the livestreamStats document
   [stringToPropertyInDotNotation: string]: FieldValue
}

/**
 *
 *  @param {boolean} isNewDataTrue - A boolean value indicating whether the field in the new data is truthy
 *  @param {boolean} isOldDataTrue - A boolean value indicating whether the field in the old data is truthy
 *  @param {OperationsToMake} operationsToMakeObject - An object storing the update operations for the firestore UPDATE operation
 *  @param {string} propertyToUpdate - The name of the field that is being updated
 * */
export const addOperationWithBooleanCheck = (
   isNewDataTrue: boolean,
   isOldDataTrue: boolean,
   operationsToMakeObject: OperationsToMake,
   propertyToUpdate: string
) => {
   // Check if the field in the new data is different from the field in the old data
   if (isNewDataTrue !== isOldDataTrue) {
      // Get the property to update in the operationsToMakeObject
      if (isNewDataTrue) {
         // If the field in the new data is truthy, we know that the field has been added, so we increment the field
         operationsToMakeObject[propertyToUpdate] = increment(1)
      } else {
         // If the field in the new data is falsy, we know that the field has been removed, so we decrement the field
         operationsToMakeObject[propertyToUpdate] = increment(-1)
      }
   }
}

/**
 *
 *  @param {boolean} newNumber - The new number that the field has been updated to
 *  @param {boolean} oldNumber - The old number that the field used to have
 *  @param {OperationsToMake} operationsToMakeObject - An object storing the update operations for the firestore UPDATE operation
 *  @param {string} propertyToUpdate - The name of the field that is being updated
 * */
export const addOperationWithNumberCheck = (
   newNumber: number,
   oldNumber: number,
   operationsToMakeObject: OperationsToMake,
   propertyToUpdate: string
) => {
   // Check if the number in the new data is different from the number in the old data
   if (newNumber !== oldNumber) {
      // Get the difference between the new number and the old number
      const difference = newNumber - oldNumber

      // Increment/decrement the field by the difference, if the difference is positive, we increment, if the difference is negative, we decrement
      operationsToMakeObject[propertyToUpdate] = increment(difference)
   }
}

export const increment = (amount: number) => FieldValue.increment(amount)
