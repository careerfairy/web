import React from "react";
import ViewerLayout from "../../../../../layouts/ViewerLayout";
import ViewerOverview from "../../../../../components/views/viewer";
import Head from "next/head";
import { handleRedirectToNextGen } from "../../../../../util/serverSidePropsMethods";

const ViewerPage = () => {
   return (
      <React.Fragment>
         <Head>
            <title>CareerFairy | Watch live streams. Get hired.</title>
            <meta name="google" content="notranslate" />
         </Head>
         <ViewerLayout isBreakout>
            <ViewerOverview />
         </ViewerLayout>
      </React.Fragment>
   );
};

export async function getServerSideProps(context) {
   return handleRedirectToNextGen(context);
}

export default ViewerPage;
