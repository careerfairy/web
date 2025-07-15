import {
   getLivestreamDialogData,
   LivestreamDialogLayout,
} from "components/views/livestream-dialog"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router"
import { Fragment, useEffect } from "react"
import SEO from "../../../components/util/SEO"
import GenericDashboardLayout from "../../../layouts/GenericDashboardLayout"

import { SearchProvider } from "components/views/search/SearchContext"
import SearchField from "components/views/search/SearchField"
import SearchResults from "components/views/search/SearchResults"

type SearchPageProps = {
   livestreamDialogData: any
}

const SearchPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ livestreamDialogData }) => {
   const router = useRouter()

   // Redirect to /portal if no search query is provided
   useEffect(() => {
      if (router.isReady && !router.query.q) {
         router.replace("/portal")
      }
   }, [router.isReady, router.query.q, router])

   // Don't render anything while redirecting
   if (!router.isReady || !router.query.q) {
      return null
   }

   return (
      <Fragment>
         <SEO
            id={"CareerFairy | Search"}
            title={"CareerFairy | Search"}
            noIndex={true}
            description="Internal search page - not for public indexing"
            additionalMetaTags={[
               {
                  name: "robots",
                  content: "noindex, nofollow, noarchive, nosnippet",
               },
            ]}
         />
         <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
            <GenericDashboardLayout
               pageDisplayName={""}
               headerType="sticky"
               blurHeaderOnScroll
               headerScrollThreshold={20}
            >
               <SearchProvider>
                  <SearchField />
                  <SearchResults />
               </SearchProvider>
            </GenericDashboardLayout>
         </LivestreamDialogLayout>
      </Fragment>
   )
}

export const getServerSideProps: GetServerSideProps<SearchPageProps> = async (
   context
) => {
   const livestreamDialogData = await getLivestreamDialogData(context)

   return {
      props: {
         livestreamDialogData,
      },
   }
}

export default SearchPage
