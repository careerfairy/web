import React from "react";
import { store } from "pages/_app";
import {
   getServerSideGroup,
   serializeServerSideStream,
} from "../../../util/serverUtil";

const EmbeddedGroupStreamsPage = (props) => {
   console.log("-> props", props);
   return <div></div>;
};

export async function getServerSideProps({ query: { groupId } }) {

   if (!groupId)
      return {
         notFound: true,
      };
   const serverSideGroup = await getServerSideGroup(groupId);

   if (!serverSideGroup.id) {
      return {
         notFound: true,
      };
   }

   const groupStreamSnaps = await store.firestore.get({
      collection: "livestreams",
      where: ["groupIds", "array-contains", groupId],
   });

   const groupStreams = groupStreamSnaps.docs
      .filter((streamDoc) => streamDoc.exists)
      .map((streamDoc) =>
         serializeServerSideStream({ id: streamDoc.id, ...streamDoc.data() })
      );

   return {
      props: { group: serverSideGroup, streams: groupStreams, groupId },
   };
}

export default EmbeddedGroupStreamsPage;
