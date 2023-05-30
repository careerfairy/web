import React from "react"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import NextLiveStreamsWithFilter from "../../components/views/common/NextLivestreams/NextLiveStreamsWithFilter"
import SEO from "../../components/util/SEO"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import {
   GetServerSidePropsContext,
   InferGetServerSidePropsType,
   NextPage,
} from "next"
import {
   getLivestreamDialogData,
   LivestreamDialogLayout,
} from "../../components/views/livestream-dialog"
import { convertQueryParamsToString } from "../../util/serverUtil"

const NextLivestreamsPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
   return (
      <LivestreamDialogLayout livestreamDialogData={props.livestreamDialogData}>
         <SEO
            id={"CareerFairy | Upcoming Livestreams"}
            description={"CareerFairy | Upcoming Livestreams"}
            title={"CareerFairy | Upcoming Livestreams"}
         />
         <GenericDashboardLayout pageDisplayName={"Live streams"}>
            <NextLiveStreamsWithFilter initialTabValue={"upcomingEvents"} />
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </LivestreamDialogLayout>
   )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
   const [firstParam] = ctx.params?.livestreamDialog || []

   // If firstParam exists, and it is not 'livestream', we assume it's a group ID,
   // and we need to redirect it to the new group route.
   if (firstParam && firstParam !== "livestream") {
      const res = ctx.res

      // Extract and stringify the query parameters, if any.
      delete ctx.query.livestreamDialog // Remove the livestreamDialog query param

      const queryString = convertQueryParamsToString(ctx.query)
      const redirectUrl = queryString
         ? `/next-livestreams/group/${firstParam}?${queryString}` // If there were query params, append them to the URL and forward them
         : `/next-livestreams/group/${firstParam}`

      // Set the HTTP status code to 301 (Moved Permanently) This will now be cached by the browser for instant redirects in the future
      res.statusCode = 301

      // Update the Location header to point to the new URL
      res.setHeader("Location", redirectUrl)
      // End the response to ensure the redirect happens
      res.end()
      // Return empty props because we're redirecting and don't need to render the component
      return { props: {} }
   }

   return {
      props: {
         livestreamDialogData: await getLivestreamDialogData(ctx),
      },
   }
}

export default NextLivestreamsPage
