import { FC, useMemo } from "react"
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
}

const Companies: FC<Props> = ({ initialData }) => {
   const isMounted = useMountedState()
   const { query } = useRouter()

   const {
      companyCountries,
      // TODO:WG add additinal query variables
   } = useMemo(() => getQueryVariables(query), [query])

   const hasFilters = companyCountries?.length > 0 || false
   const options = useMemo<UseInfiniteCompanies>(
      () => ({
         filters: { companyCountries: companyCountries },
         initialData: hasFilters ? [] : initialData,
         limit: COMPANIES_PAGE_SIZE,
      }),
      [initialData, companyCountries, hasFilters]
   )

   const {
      documents: companies,
      getMore,
      hasMore,
      loading,
   } = useInfiniteCompanies(options)
   const renderCompanies = isMounted() ? companies : initialData
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
      publicSparks: queryParamToBool(query.publicSparks as string),
      companySize: queryParamToArr(query.companySize),
   }
}

export default Companies
