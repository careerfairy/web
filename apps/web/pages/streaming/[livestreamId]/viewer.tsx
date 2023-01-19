import React, { useEffect } from "react"
import Head from "next/head"
import dynamic from "next/dynamic"
import StreamingLoader from "../../../components/views/loader/StreamingLoader"
import { useRouter } from "next/router"
import { closePrivacyWall } from "util/ConsentUtils"

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
   useCloseUsercentrics()

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
 * Close the Usercentrics dialog if we're on a recording session
 */
const useCloseUsercentrics = () => {
   const { query } = useRouter()
   useEffect(() => {
      let timeout: NodeJS.Timeout
      if (query.isRecordingWindow) {
         closePrivacyWall()

         // just to be completely sure there isn't a race condition anywhere
         // try to close the dialog after some seconds as well
         timeout = setTimeout(() => {
            closePrivacyWall()
         }, 4000)
      }

      return () => {
         clearTimeout(timeout)
      }
   }, [query.isRecordingWindow])
}

export default ViewerPage
