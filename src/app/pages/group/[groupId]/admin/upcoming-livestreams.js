import React from "react";

const UpcomingStreamsPage = () => {
   return <div />;
};

export async function getServerSideProps({ query: { groupId, livestreamId } }) {
   let destination;
   if (!groupId) {
      destination = "/";
   } else {
      destination = livestreamId
         ? `/group/${groupId}/admin/events?eventId=${livestreamId}`
         : `/group/${groupId}/admin/events`;
   }

   return {
      props: {},
      redirect: {
         destination: destination,
         permanent: false,
      },
   };
}

export default UpcomingStreamsPage;
