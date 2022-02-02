import React from "react";
import dynamic from "next/dynamic";

const StreamerOverview = dynamic(
   () => import("../../../components/views/streaming"),
   { ssr: false }
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
