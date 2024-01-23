import ScrollToTop from "../../components/views/common/ScrollToTop"
import React from "react"
import SEO from "../../components/util/SEO"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import CompaniesPageOverview from "../../components/views/companies/CompaniesPageOverview"
import { InferGetServerSidePropsType, NextPage } from "next"
// import { FilterCompanyOptions } from "@careerfairy/shared-lib/groups"
import { deserializeGroups } from "util/serverUtil"
// import { companyService } from "data/firebase/CompanyService"

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
            <CompaniesPageOverview
               serverSideCompanies={deserializeGroups(serverSideCompanies)}
            />
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </>
   )
}

// TODO-WG: Apply server side filtering with service
export const getServerSideProps = async () => {
   // const filterOptions: FilterCompanyOptions = {}
   // const companies = await companyService.fetchLivestreams(filterOptions)

   return {
      props: {
         serverSideCompanies: [],
      },
   }
}

export default CompaniesPage
