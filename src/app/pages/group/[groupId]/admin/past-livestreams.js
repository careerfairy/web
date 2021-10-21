import React from "react";

const PastStreamsPage = () => {
   return <div />;
};

export async function getServerSideProps({ query: { groupId, livestreamId } }) {
   console.log("-> groupId", groupId);
   let destination;
   if (!groupId) {
      destination = "/";
   } else {
      destination = livestreamId
         ? `/group/${groupId}/events?eventId=${livestreamId}`
         : `/group/${groupId}/events`;
   }

   return {
      props: {},
      redirect: {
         destination: destination,
         permanent: false,
      },
   };
}

export default PastStreamsPage;
