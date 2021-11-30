import React from "react";
import StreamerOverview from "../../../../../components/views/streaming";
import StreamerLayout from "../../../../../layouts/StreamerLayout";

const StreamerPage = () => {
   return (
      <StreamerLayout isBreakout>
         <StreamerOverview />
      </StreamerLayout>
   );
};

export default StreamerPage;
