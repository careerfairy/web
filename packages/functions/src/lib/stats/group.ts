import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { addOperationWithNumberCheck, OperationsToMake } from "./util"
import { getAValidGroupStatsUpdateField } from "@careerfairy/shared-lib/groups/stats"

/**
 *
 * @param newData The new LiveStreamStats document
 * @param oldData The old LiveStreamStats document
 * @param operationsToMakeObject The object that will be updated with the operations to make
 * @param universityCode The university code to update the operationsToMakeObject for
 * */
export const addGroupStatsOperations = (
   newData: LiveStreamStats,
   oldData: LiveStreamStats,
   operationsToMakeObject: OperationsToMake,
   universityCode?: string
) => {
   const newStatsObject = universityCode
      ? newData?.universityStats[universityCode]
      : newData?.generalStats

   const oldStatsObject = universityCode
      ? oldData?.universityStats[universityCode]
      : oldData?.generalStats

   // Add operations for people reached
   addOperationWithNumberCheck(
      newStatsObject?.numberOfPeopleReached || 0,
      oldStatsObject?.numberOfPeopleReached || 0,
      operationsToMakeObject,
      getAValidGroupStatsUpdateField("numberOfPeopleReached", universityCode)
   )

   // Add operations for registrations
   addOperationWithNumberCheck(
      newStatsObject?.numberOfRegistrations || 0,
      oldStatsObject?.numberOfRegistrations || 0,
      operationsToMakeObject,
      getAValidGroupStatsUpdateField("numberOfRegistrations", universityCode)
   )

   // Add operations participants
   addOperationWithNumberCheck(
      newStatsObject?.numberOfParticipants || 0,
      oldStatsObject?.numberOfParticipants || 0,
      operationsToMakeObject,
      getAValidGroupStatsUpdateField("numberOfParticipants", universityCode)
   )

   // Add operations for applications to events
   addOperationWithNumberCheck(
      newStatsObject?.numberOfApplicants || 0,
      oldStatsObject?.numberOfApplicants || 0,
      operationsToMakeObject,
      getAValidGroupStatsUpdateField("numberOfApplicants", universityCode)
   )

   if (!universityCode) {
      const allPossibleUniversityCodes = Object.keys(
         Object.assign(
            {},
            newData?.universityStats || {},
            oldData?.universityStats || {}
         )
      )

      allPossibleUniversityCodes.forEach((universityCode) => {
         addGroupStatsOperations(
            // Recursively call the function to update the operationsToMakeObject for all universities
            newData,
            oldData,
            operationsToMakeObject,
            universityCode
         )
      })
   }
}

export const addOperationsToDecrementGroupStatsOperations = (
   newData: LiveStreamStats,
   oldData: LiveStreamStats,
   operationsToMakeObject: OperationsToMake
) => {
   // Since the function is only decrementing the fields, it uses null as the new data argument,
   // and oldLivestreamStatsMap as the old data argument. This way the function will decrement all
   // the fields that are truthy in the old data but not in the new data, which in this case is null.
   addGroupStatsOperations(null, oldData, operationsToMakeObject)
}

export const addOperationsToOnlyIncrementGroupStatsOperations = (
   newData: LiveStreamStats,
   oldData: LiveStreamStats,
   operationsToMakeObject: OperationsToMake
) => {
   // Since the function is only incrementing the fields, it uses newData as the new data argument,
   addGroupStatsOperations(newData, null, operationsToMakeObject)
}
