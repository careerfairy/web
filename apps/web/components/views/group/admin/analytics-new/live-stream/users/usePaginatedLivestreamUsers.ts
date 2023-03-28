import usePaginatedCollection, {
   UsePaginatedCollection,
} from "components/custom-hook/utils/usePaginatedCollection"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, query, where, orderBy } from "firebase/firestore"
import { useMemo } from "react"
import {
   LivestreamUserAction,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { SortModel } from "../../../common/table/UserLivestreamDataTable"
import { QueryConstraint } from "@firebase/firestore"
import { University } from "@careerfairy/shared-lib/universities"
import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"

export type Filters = {
   selectedCountryCodes: string[]
   selectedUniversity: University
   selectedFieldOfStudy: FieldOfStudy
   selectedLevelOfStudy: LevelOfStudy
   userType: LivestreamUserAction
}
const usePaginatedLivestreamUsers = (
   livestreamId: string,
   limit = 10,
   sortModel: SortModel,
   filters: Filters
) => {
   // @ts-ignore we're sorting by a nested field here
   const options: UsePaginatedCollection<UserLivestreamData> = useMemo(() => {
      const constraints: QueryConstraint[] = []

      if (filters.selectedCountryCodes.length) {
         constraints.push(
            where(
               "user.universityCountryCode",
               "in",
               filters.selectedCountryCodes
            )
         )
      }

      if (filters.selectedUniversity) {
         constraints.push(
            where("user.university.code", "==", filters.selectedUniversity.id)
         )
      }

      if (filters.selectedFieldOfStudy) {
         constraints.push(
            where("user.fieldOfStudy.id", "==", filters.selectedFieldOfStudy.id)
         )
      }

      if (filters.selectedLevelOfStudy) {
         constraints.push(
            where("user.levelOfStudy.id", "==", filters.selectedLevelOfStudy.id)
         )
      }

      if (sortModel) {
         constraints.push(orderBy(sortModel.field, sortModel.sort))
      }

      return {
         query: query<UserLivestreamData>(
            // @ts-ignore
            collection(
               FirestoreInstance,
               "livestreams",
               livestreamId,
               "userLivestreamData"
            ),
            ...constraints
         ),
         limit,
         orderBy: {
            field: `${filters.userType}.date`,
            direction: "desc",
         },
         getTotalCount: true,
      }
   }, [
      sortModel,
      filters.selectedCountryCodes,
      filters.selectedUniversity,
      filters.selectedFieldOfStudy,
      filters.selectedLevelOfStudy,
      filters.userType,
      livestreamId,
      limit,
   ])

   return usePaginatedCollection<UserLivestreamData>(options)
}

export default usePaginatedLivestreamUsers
