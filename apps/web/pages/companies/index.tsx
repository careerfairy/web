import ScrollToTop from "../../components/views/common/ScrollToTop"
import React from "react"
import SEO from "../../components/util/SEO"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import CompaniesPageOverview from "../../components/views/companies/CompaniesPageOverview"
import { InferGetServerSidePropsType, NextPage } from "next"
import { getInfiniteQuery } from "../../components/views/companies/useInfiniteCompanies"
import { getDocs } from "@firebase/firestore"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Group } from "@careerfairy/shared-lib/groups"
import { COMPANIES_PAGE_SIZE } from "components/util/constants"

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

export const getServerSideProps = async () => {
   const snaps = await getDocs(getInfiniteQuery(COMPANIES_PAGE_SIZE).query)

   return {
      props: {
         serverSideCompanies: mapFirestoreDocuments<Group>(snaps),
      },
   }
}

export default CompaniesPage
