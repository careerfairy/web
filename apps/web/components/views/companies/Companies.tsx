import { FC, useEffect, useMemo } from "react"
import { FilterCompanyOptions, Group } from "@careerfairy/shared-lib/groups"
import { Grid } from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import CompanyCard from "./CompanyCard"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import { useMountedState } from "react-use"
import useCompaniesSWR from "components/custom-hook/group/useCompaniesSWR"

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
   const { companies } = useCompaniesSWR(filterOptions)

   const renderCompanies = isMounted() ? companies : initialData

   useEffect(() => {
      setResults(companies.length)
   }, [setResults, companies])

   return (
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
      </Grid>
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
      publicSparks: queryParamToBool(query.companySparks as string),
      companySize: queryParamToArr(query.companySizes),
   }
}

export default Companies
