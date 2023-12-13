import usePaginatedCollection, {
   UsePaginatedCollection,
} from "components/custom-hook/utils/usePaginatedCollection"
import { query, where } from "firebase/firestore"
import { useMemo } from "react"
import {
   CollectionReference,
   Query,
   QueryConstraint,
} from "@firebase/firestore"
import { University } from "@careerfairy/shared-lib/universities"
import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { DocumentPaths } from "../../../common/table/UserDataTableProvider"

export type Filters = {
   selectedCountryCodes: string[]
   selectedUniversity: University
   selectedFieldOfStudy: FieldOfStudy
   selectedLevelOfStudy: LevelOfStudy
   userIds: string[]
}
const usePaginatedUsersCollection = (
   targetCollectionRef: CollectionReference | Query,
   documentPaths: Partial<DocumentPaths>,
   limit = 10,
   filters: Partial<Filters>
) => {
   // @ts-ignore we're sorting by a nested field here
   const options: UsePaginatedCollection<unknown> = useMemo(() => {
      const constraints: QueryConstraint[] = []

      // If one or more countries are selected, we only want to show users from those countries
      if (filters?.selectedCountryCodes?.length) {
         constraints.push(
            where(
               documentPaths.userUniversityCountryCode,
               "in",
               filters.selectedCountryCodes
            )
         )
      }

      // If a university is selected, we only want to show users from that university
      if (filters?.selectedUniversity) {
         constraints.push(
            where(
               documentPaths.userUniversityCode,
               "==",
               filters.selectedUniversity.id
            )
         )
      }

      // If a field of study is selected, we only want to show users from that field of study
      if (filters?.selectedFieldOfStudy) {
         constraints.push(
            where(
               documentPaths.userFieldOfStudyId,
               "==",
               filters.selectedFieldOfStudy.id
            )
         )
      }

      // If a level of study is selected, we only want to show users from that level of study
      if (filters?.selectedLevelOfStudy) {
         constraints.push(
            where(
               documentPaths.userLevelOfStudyId,
               "==",
               filters.selectedLevelOfStudy.id
            )
         )
      }

      if (filters?.userIds) {
         constraints.push(where(documentPaths.userEmail, "in", filters.userIds))
      }

      return {
         query: query<unknown>(
            // @ts-ignore
            targetCollectionRef,
            ...constraints
         ),
         limit,
         orderBy: {
            field: documentPaths.orderBy,
            direction: documentPaths.orderDirection,
         },
         getTotalCount: true,
      }
   }, [
      filters.selectedCountryCodes,
      filters.selectedUniversity,
      filters.selectedFieldOfStudy,
      filters.selectedLevelOfStudy,
      filters.userIds,
      targetCollectionRef,
      limit,
      documentPaths.orderBy,
      documentPaths.orderDirection,
      documentPaths.userUniversityCountryCode,
      documentPaths.userUniversityCode,
      documentPaths.userFieldOfStudyId,
      documentPaths.userLevelOfStudyId,
      documentPaths.userEmail,
   ])

   return usePaginatedCollection<unknown>(options)
}

export default usePaginatedUsersCollection
