import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import {
   addOperationWithBooleanCheck,
   addOperationWithNumberCheck,
   OperationsToMake,
} from "./util"
import {
   getAValidLivestreamStatsUpdateField,
   LivestreamStatsMapKey,
   NestedObjectOptions,
} from "@careerfairy/shared-lib/livestreams/stats"

/**
 * This function checks which fields of the newData and oldData are different and updates the operationsToMakeObject accordingly.
 * If the universityCode argument is provided, the function will only update the operationsToMakeObject for the universityCode provided.
 *
 * @param newData The new data of the document
 * @param oldData The old data of the document
 * @param operationsToMakeObject The object that will be updated with the operations to make
 * @param nestedObjectOptions
 * */
export const addOperations = (
   newData: UserLivestreamData,
   oldData: UserLivestreamData,
   operationsToMakeObject: OperationsToMake,
   nestedObjectOptions?: NestedObjectOptions
) => {
   addOperationWithBooleanCheck(
      Boolean(newData?.participated?.date),
      Boolean(oldData?.participated?.date),
      operationsToMakeObject,
      getAValidLivestreamStatsUpdateField(
         "numberOfParticipants",
         nestedObjectOptions
      )
   )

   // Check if the user has registered
   addOperationWithBooleanCheck(
      Boolean(newData?.registered?.date),
      Boolean(oldData?.registered?.date),
      operationsToMakeObject,
      getAValidLivestreamStatsUpdateField(
         "numberOfRegistrations",
         nestedObjectOptions
      )
   )

   // Check if the user talent pool status has changed
   addOperationWithBooleanCheck(
      Boolean(newData?.talentPool?.date),
      Boolean(oldData?.talentPool?.date),
      operationsToMakeObject,
      getAValidLivestreamStatsUpdateField(
         "numberOfTalentPoolProfiles",
         nestedObjectOptions
      )
   )

   addOperationWithNumberCheck(
      Object.keys(newData?.jobApplications || {}).length,
      Object.keys(oldData?.jobApplications || {}).length,
      operationsToMakeObject,
      getAValidLivestreamStatsUpdateField(
         "numberOfApplicants",
         nestedObjectOptions
      )
   )

   // only call recursively if it's not a nested call
   if (!nestedObjectOptions) {
      handleNestedStatsObject(
         // deals with the nested universityStats object
         newData,
         oldData,
         newData?.user?.university?.code,
         oldData?.user?.university?.code,
         "universityStats",
         operationsToMakeObject
      )

      handleNestedStatsObject(
         // deals with the nested fieldOfStudyStats object
         newData,
         oldData,
         newData?.user?.fieldOfStudy?.id,
         oldData?.user?.fieldOfStudy?.id,
         "fieldOfStudyStats",
         operationsToMakeObject
      )

      handleNestedStatsObject(
         // deals with the nested countryStats object
         newData,
         oldData,
         newData?.user?.universityCountryCode,
         oldData?.user?.universityCountryCode,
         "countryStats",
         operationsToMakeObject
      )
   }
}

const handleNestedStatsObject = (
   newData: UserLivestreamData,
   oldData: UserLivestreamData,
   newValueToCompare: string,
   oldValueToCompare: string,
   statsObjectKey: LivestreamStatsMapKey,
   operationsToMakeObject: OperationsToMake
) => {
   const valueChanged = newValueToCompare !== oldValueToCompare

   if (valueChanged) {
      if (oldValueToCompare) {
         // If the old value is not null, we need to decrement the old nested value
         addOperations(null, oldData, operationsToMakeObject, {
            statsObjectKey,
            statsObjectProperty: oldValueToCompare,
         })
      }

      if (newValueToCompare) {
         // If the new value is not null, we need to increment the new nested value
         addOperations(newData, null, operationsToMakeObject, {
            statsObjectKey,
            statsObjectProperty: newValueToCompare,
         })
      }
   } else {
      if (!newValueToCompare) return // we don't want to set undefined values, eg. if the user has no university, we don't want "universityStats": { "undefined": { "numberOfParticipants": 1 } }

      addOperations(newData, oldData, operationsToMakeObject, {
         // We need to update the nested value with the new data
         statsObjectKey,
         statsObjectProperty: newValueToCompare,
      })
   }
}
