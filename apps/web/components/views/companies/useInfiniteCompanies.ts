import { useMemo } from "react"
import { QueryConstraint } from "@firebase/firestore"
import { collection, query, where } from "firebase/firestore"
import useInfiniteCollection, {
   UseInfiniteCollection,
} from "../../custom-hook/utils/useInfiniteCollection"
import { Group } from "@careerfairy/shared-lib/groups"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { ngrams } from "@careerfairy/shared-lib/utils/search"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"

type Filters = {
   searchText?: string
}

const useInfiniteCompanies = (
   limit: number = 10,
   filters: Filters = {},
   initialData?: Group[]
) => {
   // @ts-ignore we're sorting by a nested field here
   const options: UseInfiniteCollection<Group> = useMemo(
      () => getQuery(limit, filters, initialData),
      [limit, filters, initialData]
   )

   return useInfiniteCollection<Group>(options)
}

export const getQuery = (
   limit: number = 10,
   filters: Filters = {},
   initialData?: Group[]
): UseInfiniteCollection<Group> => {
   const constraints: QueryConstraint[] = []

   if (filters.searchText) {
      const ngGrams = ngrams(filters.searchText, 3)

      ngGrams.forEach((name) =>
         constraints.push(where(`triGrams.${name}`, "==", true))
      )
   }

   return {
      query: query(
         collection(FirestoreInstance, "careerCenterData"),
         where("publicProfile", "==", true),
         ...constraints
      ).withConverter(createGenericConverter<Group>()),
      limit,
      orderBy: {
         field: "universityName",
         direction: "asc",
      },
      initialData,
   }
}

export default useInfiniteCompanies
