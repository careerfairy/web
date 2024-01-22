import { FC, useEffect, useMemo } from "react"
import { FilterCompanyOptions, Group } from "@careerfairy/shared-lib/groups"
import { Grid } from "@mui/material"
import useInfiniteCompanies, {
   UseInfiniteCompanies,
} from "./useInfiniteCompanies"
import { sxStyles } from "../../../types/commonTypes"
import CompanyCard, { CompanyCardSkeleton } from "./CompanyCard"
import CustomInfiniteScroll from "../common/CustomInfiniteScroll"
import { COMPANIES_PAGE_SIZE } from "components/util/constants"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import { useMountedState } from "react-use"
import { isWithinNormalizationLimit } from "@careerfairy/shared-lib/utils/utils"

const styles = sxStyles({
   flexItem: {
      display: "flex",
   },
   root: {
      pb: 3,
   },
})

type Props = {
   initialData?: Group[]
   setResults?(counter: number): void
}

const Companies: FC<Props> = ({ initialData, setResults }) => {
   const isMounted = useMountedState()
   const { query } = useRouter()

   const filterOptions = useMemo(() => getQueryVariables(query), [query])

   const hasFilters = areCompanyFiltersApplied(filterOptions)
   const options = useMemo<UseInfiniteCompanies>(
      () => ({
         filters: {
            companyCountries: filterOptions.companyCountries,
            publicSparks: filterOptions.publicSparks,
            companyIndustries: filterOptions.companyIndustries,
            companySize: filterOptions.companySize,
         },
         initialData: hasFilters ? [] : initialData,
         limit: COMPANIES_PAGE_SIZE,
         count: true,
      }),
      [
         filterOptions.companyCountries,
         filterOptions.publicSparks,
         filterOptions.companyIndustries,
         filterOptions.companySize,
         hasFilters,
         initialData,
      ]
   )

   const {
      documents: companies,
      getMore,
      hasMore,
      loading,
      totalCount,
   } = useInfiniteCompanies(options)

   const renderCompanies = isMounted() ? companies : initialData

   useEffect(() => {
      if (totalCount.error) {
         console.log("Error retrieving totalCount: " + totalCount.error)
         return
      }
      if (!totalCount.loading) setResults(totalCount.count)
   }, [setResults, totalCount])

   const normalizationLimit = isWithinNormalizationLimit(
      FIRESTORE_QUERY_NORMALIZATION_LIMIT,
      filterOptions.companyCountries,
      filterOptions.companyIndustries,
      filterOptions.companySize
   )
   console.log("🚀 ~ normalizationLimit:", normalizationLimit)

   return (
      <CustomInfiniteScroll hasMore={hasMore} next={getMore} loading={loading}>
         <Grid sx={styles.root} container spacing={2}>
            {renderCompanies.map((company) => (
               <Grid
                  sx={styles.flexItem}
                  key={company.id}
                  item
                  xs={12}
                  sm={6}
                  lg={4}
                  xl={3}
               >
                  <CompanyCard company={company} />
               </Grid>
            ))}
            {loading ? (
               <Grid sx={styles.flexItem} item xs={12} sm={6} lg={4} xl={3}>
                  <CompanyCardSkeleton />
               </Grid>
            ) : null}
         </Grid>
      </CustomInfiniteScroll>
   )
}

const areCompanyFiltersApplied = (filters: FilterCompanyOptions): boolean => {
   if (!filters) return false

   return (
      !isArrayEmpty(filters.companyCountries) ||
      !isArrayEmpty(filters.companyIndustries) ||
      !isArrayEmpty(filters.companySize) ||
      filters.publicSparks
   )
}

const isArrayEmpty = (arr): boolean => {
   if (!Array.isArray(arr) || !arr.length) {
      // array does not exist, is not an array, or is empty
      // ⇒ do not attempt to process array
      return true
   }
   return false
}
const queryParamToArr = (
   queryParam: string | string[] | undefined
): string[] => {
   if (!queryParam) return []
   if (Array.isArray(queryParam)) return queryParam.sort()
   return queryParam.split(",").sort() // to make sure the order is always the same for caching the key
}

const queryParamToBool = (
   queryParam: string | string[] | undefined
): boolean => {
   if (!queryParam || Array.isArray(queryParam)) return false
   return queryParam?.toLowerCase() === "true" || false
}
/**
 *
 * @param query Query string object, all aplied filters are passed by query string parameters.
 * @returns @type FilterCompanyOptions mapped from the query string object
 */
const getQueryVariables = (query: ParsedUrlQuery): FilterCompanyOptions => {
   return {
      companyCountries: queryParamToArr(query.companyCountries),
      companyIndustries: queryParamToArr(query.companyIndustries),
      publicSparks: queryParamToBool(query.companySparks as string),
      companySize: queryParamToArr(query.companySizes),
   }
}

const FIRESTORE_QUERY_NORMALIZATION_LIMIT = 30

export default Companies
