import React from "react";
import dynamic from "next/dynamic";
import StreamingLoader from "../../../components/views/loader/StreamingLoader";

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

export default StreamerPage;
