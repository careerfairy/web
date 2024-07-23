import StreamingLoader from "components/views/loader/StreamingLoader"
import dynamic from "next/dynamic"
import { encode } from "querystring"
import React from "react"

const StreamerOverview = dynamic(
   () => import("../../../components/views/streaming"),
   {
      ssr: false,
      loading: () => <StreamingLoader />,
   }
)
const StreamerLayout = dynamic(
   () => import("../../../layouts/StreamerLayout"),
   { ssr: false }
)

const StreamerPage = () => {
   return (
      <StreamerLayout isMainStreamer>
         <StreamerOverview />
      </StreamerLayout>
   )
}

export const getServerSideProps = async (context) => {
   const { livestreamId, ...params } = context.query
   const queryParamString = encode(params)

   return {
      redirect: {
         permanent: false,
         destination: `/streaming/host/${livestreamId}${
            queryParamString && `?${queryParamString}`
         }`,
      },
   }
}

export default StreamerPage
