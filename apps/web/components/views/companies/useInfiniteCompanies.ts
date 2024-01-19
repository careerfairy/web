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
export type Filters = {
   companyCountries?: string[]
   companyIndustries?: string[]
   companySize?: string[]
   publicSparks?: boolean
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
   pageSize = 10,
   filters: Filters = {}
): Query<Group> => {
   const constraints: QueryConstraint[] = []

   if (filters.companyCountries?.length > 0) {
      constraints.push(
         where("companyCountry.id", "in", filters.companyCountries)
      )
   }
   /**
    * The filter for @field publicSparks is only applied when value == true, filtering for 'true' only.
    * Otherwise the filter is not applied, meaning filtering for companies which have publicSparks == false or any
    * value is not possible when using this filter.
    * This is intended.
    */
   if (filters.publicSparks) {
      constraints.push(where("publicSparks", "==", true))
   }

   if (filters.companySize?.length) {
      constraints.push(where("companySize", "in", filters.companySize))
   }

   if (filters.companyIndustries?.length) {
      constraints.push(
         where("companyIndustries.id", "in", filters.companyIndustries)
      )
   }

   return query(
      collection(FirestoreInstance, "careerCenterData"),
      where("publicProfile", "==", true),
      where("test", "==", false),
      ...constraints,
      limit(pageSize),
      orderBy("normalizedUniversityName", "asc")
   ).withConverter(createGenericConverter<Group>())
}

export default useInfiniteCompanies
