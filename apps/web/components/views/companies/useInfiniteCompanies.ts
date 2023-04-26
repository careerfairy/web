import { useMemo } from "react"
import { limit, Query, QueryConstraint } from "@firebase/firestore"
import { collection, orderBy, query, where } from "firebase/firestore"
import useInfiniteCollection, {
   UseInfiniteCollection,
} from "../../custom-hook/utils/useInfiniteCollection"
import { Group } from "@careerfairy/shared-lib/groups"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"

/**
 * This is where you can add filters to the query as this hook grows
 * */
type Filters = {
   // industries?: string[]
   // companySizes?: string[]
}

export type UseInfiniteCompanies = {
   limit: number
   filters: Filters
   initialData?: Group[]
}

const useInfiniteCompanies = ({
   filters,
   initialData,
   limit,
}: UseInfiniteCompanies) => {
   const options: UseInfiniteCollection<Group> = useMemo(() => {
      return {
         query: getInfiniteQuery(limit, filters),
         limit,
         initialData,
      }
   }, [limit, filters, initialData])

   return useInfiniteCollection<Group>(options)
}

export const getInfiniteQuery = (
   pageSIze: number = 10,
   filters: Filters = {}
): Query<Group> => {
   const constraints: QueryConstraint[] = []

   // if (filters.industries) {
   //    constraints.push(
   //       where("companyIndustry", "in", filters.industries)
   //    )

   return query(
      collection(FirestoreInstance, "careerCenterData"),
      where("publicProfile", "==", true),
      ...constraints,
      limit(pageSIze),
      orderBy("universityName", "asc")
   ).withConverter(createGenericConverter<Group>())
}

export default useInfiniteCompanies
