import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import StreamingLoader from "../../../components/views/loader/StreamingLoader";
import { handleRedirectToNextGen } from "../../../util/serverSidePropsMethods";

const ViewerLayout = dynamic(() => import("../../../layouts/ViewerLayout"), {
   ssr: false,
});
const ViewerOverview = dynamic(
   () => import("../../../components/views/viewer"),
   {
      ssr: false,
      loading: () => <StreamingLoader />,
   }
);
const ViewerPage = () => {
   return (
      <React.Fragment>
         <Head>
            <title>CareerFairy | Watch live streams. Get hired.</title>
            <meta name="google" content="notranslate" />
         </Head>
         <ViewerLayout>
            <ViewerOverview />
         </ViewerLayout>
      </React.Fragment>
   );
};

export async function getServerSideProps(context) {
   return handleRedirectToNextGen(context);
}

export default ViewerPage;
