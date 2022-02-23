import React from "react";
import dynamic from "next/dynamic";
import StreamingLoader from "../../../components/views/loader/StreamingLoader";
import { handleRedirectToNextGen } from "../../../util/serverSidePropsMethods";

const StreamerOverview = dynamic(
   () => import("../../../components/views/streaming"),
   {
      ssr: false,
      loading: () => <StreamingLoader />,
   }
);
const StreamerLayout = dynamic(
   () => import("../../../layouts/StreamerLayout"),
   { ssr: false }
);

const StreamerPage = () => {
   return (
      <StreamerLayout>
         <StreamerOverview />
      </StreamerLayout>
   );
};

export async function getServerSideProps(context) {
   return handleRedirectToNextGen(context);
}

export default StreamerPage;
