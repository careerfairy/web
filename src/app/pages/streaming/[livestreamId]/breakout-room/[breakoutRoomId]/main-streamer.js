import React from "react";
import StreamerOverview from "../../../../../components/views/streaming";
import StreamerLayout from "../../../../../layouts/StreamerLayout";
import { handleRedirectToNextGen } from "../../../../../util/serverSidePropsMethods";

const StreamerPage = () => {
   return (
      <StreamerLayout isMainStreamer isBreakout>
         <StreamerOverview />
      </StreamerLayout>
   );
};

export async function getServerSideProps(context) {
   return handleRedirectToNextGen(context);
}

export default StreamerPage;
