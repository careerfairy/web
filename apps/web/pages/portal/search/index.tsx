import { Container } from "@mui/material"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import { NextPage } from "next"
import { useRouter } from "next/router"
import { Fragment, useEffect } from "react"
import SEO from "../../../components/util/SEO"
import { useAuth } from "../../../HOCs/AuthProvider"
import GenericDashboardLayout from "../../../layouts/GenericDashboardLayout"

import {
   SearchProvider,
   useSearchContext,
} from "components/views/search/SearchContext"
import { SearchField } from "components/views/search/SearchField"
import { SearchResults } from "components/views/search/SearchResults"

const SearchPageContent = () => {
   const { authenticatedUser } = useAuth()
   const { selectedLivestreamId, handleCloseLivestreamDialog } =
      useSearchContext()

   return (
      <>
         <SearchField type="backButton" />
         <SearchResults />
         <LivestreamDialog
            open={Boolean(selectedLivestreamId)}
            livestreamId={selectedLivestreamId || ""}
            handleClose={handleCloseLivestreamDialog}
            mode="stand-alone"
            initialPage={"details"}
            serverUserEmail={authenticatedUser?.email || ""}
            providedOriginSource={`search-page-${selectedLivestreamId}`}
         />
      </>
   )
}

const SearchPage: NextPage = () => {
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
         <GenericDashboardLayout
            pageDisplayName={""}
            headerType="sticky"
            blurHeaderOnScroll
            headerScrollThreshold={20}
         >
            <Container disableGutters>
               <SearchProvider>
                  <SearchPageContent />
               </SearchProvider>
            </Container>
         </GenericDashboardLayout>
      </Fragment>
   )
}

export default SearchPage
