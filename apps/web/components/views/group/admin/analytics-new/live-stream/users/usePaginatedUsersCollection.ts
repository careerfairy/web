import usePaginatedCollection, {
   UsePaginatedCollection,
} from "components/custom-hook/utils/usePaginatedCollection"
import { orderBy, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { SortModel } from "../../../common/table/UserLivestreamDataTable"
import { CollectionReference, QueryConstraint } from "@firebase/firestore"
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
}
const usePaginatedUsersCollection = (
   targetCollectionRef: CollectionReference,
   documentPaths: DocumentPaths,
   limit = 10,
   sortModel: SortModel,
   filters: Filters
) => {
   // @ts-ignore we're sorting by a nested field here
   const options: UsePaginatedCollection<unknown> = useMemo(() => {
      const constraints: QueryConstraint[] = []

      if (filters.selectedCountryCodes.length) {
         constraints.push(
            where(
               documentPaths.userUniversityCountryCode,
               "in",
               filters.selectedCountryCodes
            )
         )
      }

      if (filters.selectedUniversity) {
         constraints.push(
            where(
               documentPaths.userUniversityCode,
               "==",
               filters.selectedUniversity.id
            )
         )
      }

      if (filters.selectedFieldOfStudy) {
         constraints.push(
            where(
               documentPaths.userFieldOfStudyId,
               "==",
               filters.selectedFieldOfStudy.id
            )
         )
      }

      if (filters.selectedLevelOfStudy) {
         constraints.push(
            where(
               documentPaths.userLevelOfStudyId,
               "==",
               filters.selectedLevelOfStudy.id
            )
         )
      }

      if (sortModel) {
         constraints.push(orderBy(sortModel.field, sortModel.sort))
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
      sortModel,
      targetCollectionRef,
      limit,
      documentPaths.orderBy,
      documentPaths.orderDirection,
      documentPaths.userUniversityCountryCode,
      documentPaths.userUniversityCode,
      documentPaths.userFieldOfStudyId,
      documentPaths.userLevelOfStudyId,
   ])

   return usePaginatedCollection<unknown>(options)
}

export default usePaginatedUsersCollection
