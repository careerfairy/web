import ScrollToTop from "../../components/views/common/ScrollToTop"
import React from "react"
import SEO from "../../components/util/SEO"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import CompaniesPageOverview from "../../components/views/companies/CompaniesPageOverview"
import { InferGetServerSidePropsType, NextPage } from "next"
import { FilterCompanyOptions } from "@careerfairy/shared-lib/groups"
import { companyService } from "data/firebase/CompanyService"
import { CompanyIndustryValues } from "constants/forms"

type Props = InferGetServerSidePropsType<typeof getServerSideProps>
const CompaniesPage: NextPage<Props> = ({ serverSideCompanies }) => {
   return (
      <>
         <SEO
            id={"CareerFairy | Companies"}
            description={"Meet all the partners of CareerFairy."}
            title={"CareerFairy | Companies"}
         />
         <GenericDashboardLayout pageDisplayName={"Companies"}>
            <CompaniesPageOverview serverSideCompanies={serverSideCompanies} />
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </>
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
const getQueryVariables = (query): FilterCompanyOptions => {
   return {
      companyCountries: queryParamToArr(query.companyCountries),
      companyIndustries: queryParamToArr(query.companyIndustries),
      publicSparks: queryParamToBool(query.companySparks as string),
      companySize: queryParamToArr(query.companySizes),
      allCompanyIndustries: CompanyIndustryValues,
   }
}

export const getServerSideProps = async (ctx) => {
   const query = getQueryVariables(ctx.query)
   console.log("🚀 ~ getServerSideProps ~ query:", query)

   const companies = await companyService.fetchCompanies(query)
   console.log("🚀 ~ getServerSideProps ~ companies.length:", companies.length)

   return {
      props: {
         serverSideCompanies: companies,
      },
   }
}

export default CompaniesPage
