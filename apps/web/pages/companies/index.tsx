import ScrollToTop from "../../components/views/common/ScrollToTop"
import React from "react"
import SEO from "../../components/util/SEO"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import CompaniesPageOverview from "../../components/views/companies/CompaniesPageOverview"
import {
   GetServerSidePropsContext,
   InferGetServerSidePropsType,
   NextPage,
} from "next"
import { getQuery } from "../../components/views/companies/useInfiniteCompanies"
import { getDocs } from "@firebase/firestore"

const PAGE_SIZE = 6

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

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
   const searchQuery = ctx.query.searchQuery as string

   const { query } = getQuery(PAGE_SIZE, {
      searchText: searchQuery,
   })

   const snaps = await getDocs(query)
   const serverSideCompanies = snaps.docs.map((doc) => doc.data())
   console.log("-> serverSideCompanies", serverSideCompanies)

   return {
      props: {
         serverSideCompanies,
      },
   }
}

export default CompaniesPage
