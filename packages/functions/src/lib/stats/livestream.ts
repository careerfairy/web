import { UserLivestreamData } from "@careerfairy/shared-lib/dist/livestreams"
import { getPropertyToUpdate } from "@careerfairy/shared-lib/dist/livestreams/stats"
import {
   addOperationWithBooleanCheck,
   addOperationWithNumberCheck,
   OperationsToMake,
} from "./util"

/**
 * This function checks which fields of the newData and oldData are different and updates the operationsToMakeObject accordingly.
 * If the universityCode argument is provided, the function will only update the operationsToMakeObject for the universityCode provided.
 *
 * @param newData The new data of the document
 * @param oldData The old data of the document
 * @param operationsToMakeObject The object that will be updated with the operations to make
 * @param universityCode The university code to update the operationsToMakeObject for
 * */
export const addOperations = (
   newData: UserLivestreamData,
   oldData: UserLivestreamData,
   operationsToMakeObject: OperationsToMake,
   universityCode?: string
) => {
   addOperationWithBooleanCheck(
      Boolean(newData?.participated?.date),
      Boolean(oldData?.participated?.date),
      operationsToMakeObject,
      getPropertyToUpdate("numberOfParticipants", universityCode)
   )

   // Check if the user has registered
   addOperationWithBooleanCheck(
      Boolean(newData?.registered?.date),
      Boolean(oldData?.registered?.date),
      operationsToMakeObject,
      getPropertyToUpdate("numberOfRegistrations", universityCode)
   )

   // Check if the user talent pool status has changed
   addOperationWithBooleanCheck(
      Boolean(newData?.talentPool?.date),
      Boolean(oldData?.talentPool?.date),
      operationsToMakeObject,
      getPropertyToUpdate("numberOfTalentPoolProfiles", universityCode)
   )

   addOperationWithNumberCheck(
      Object.keys(newData?.jobApplications || {}).length,
      Object.keys(oldData?.jobApplications || {}).length,
      operationsToMakeObject,
      getPropertyToUpdate("numberOfApplicants", universityCode)
   )
}

export const addOperationsToDecrementOldUniversityStats = (
   oldUniversityCode: string,
   oldUserLivestreamData: UserLivestreamData,
   operationsToMakeObject: OperationsToMake
) => {
   // Since the function is only decrementing the fields, it uses null as the new data argument,
   // and oldUserLivestreamData as the old data argument. This way the function will decrement all
   // the fields that are truthy in the old data but not in the new data, which in this case is null.
   addOperations(
      null,
      oldUserLivestreamData,
      operationsToMakeObject,
      oldUniversityCode
   )
}

export const addOperationsToIncrementNewUniversityStats = (
   newUniversityCode: string,
   newUserLivestreamData: UserLivestreamData,
   operationsToMakeObject: OperationsToMake
) => {
   // Since the function is only incrementing the fields, it uses newUserLivestreamData as the new data argument,
   // and null as the old data argument. This way the function will increment all the fields that are truthy in
   // the new data but not in the old data, which in this case is null.
   addOperations(
      newUserLivestreamData,
      null,
      operationsToMakeObject,
      newUniversityCode
   )
}
