import { livestreamRepo } from "data/RepositoryInstances"
import { GetServerSideProps, GetServerSidePropsContext } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"
import { encode } from "querystring"
import React from "react"
import StreamingLoader from "../../../components/views/loader/StreamingLoader"

const ViewerLayout = dynamic(() => import("../../../layouts/ViewerLayout"), {
   ssr: false,
})

const ViewerOverview = dynamic(
   () => import("../../../components/views/viewer"),
   {
      ssr: false,
      loading: () => <StreamingLoader />,
   }
)

const ViewerPage = () => {
   return (
      <React.Fragment>
         <Head>
            <title>CareerFairy | Watch live streams. Get hired.</title>
            <meta name="google" content="notranslate" />
         </Head>
         <ViewerLayout>
            {/* @ts-ignore */}
            <ViewerOverview />
         </ViewerLayout>
      </React.Fragment>
   )
}

/**
 * Force the page to be initially rendered on the server
 *
 * This is required to allow the _document.tsx to access the correct request
 * context data (query string params) and disable Usercentrics for certain scenarios
 * like the recording session
 */
export const getServerSideProps: GetServerSideProps = async (
   context: GetServerSidePropsContext
) => {
   const { livestreamId, ...params } = context.query
   const queryParamString = encode(params)

   const livestreamData = await livestreamRepo.getById(livestreamId as string)

   if (!livestreamData?.useOldUI) {
      return {
         redirect: {
            permanent: false,
            destination: `/streaming/viewer/${livestreamId}${
               queryParamString && `?${queryParamString}`
            }`,
         },
      }
   }

   return { props: {} }
}

export default ViewerPage
