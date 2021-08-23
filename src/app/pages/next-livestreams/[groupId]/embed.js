import React, { useMemo, useState } from "react";
import { store } from "pages/_app";
import {
   getServerSideGroup,
   parseStreamDates,
   serializeServerSideStream,
} from "util/serverUtil";
import { getResizedUrl } from "components/helperFunctions/HelperFunctions";
import { NEXT_LIVESTREAMS_PATH, PRODUCTION_BASE_URL } from "constants/routes";
import HeadWithMeta from "components/page/HeadWithMeta";
import { Container, Grid, useMediaQuery } from "@material-ui/core";
import GroupStreamCardV2 from "components/views/NextLivestreams/GroupStreams/groupStreamCard/GroupStreamCardV2";
import { useAuth } from "HOCs/AuthProvider";
import { useTheme } from "@material-ui/core/styles";

const EmbeddedGroupStreamsPage = ({ group, streams, groupId }) => {
   const { userData, authenticatedUser: user } = useAuth();
   const theme = useTheme();
   const mobile = useMediaQuery(theme.breakpoints.down("sm"));
   const [deSerializedStreams, setDeSerializedStreams] = useState(streams);

   const metaInfo = useMemo(
      () => ({
         description: group.description,
         title: `CareerFairy | Next Livestreams of ${group.universityName}`,
         image: getResizedUrl(group.logoUrl, "lg"),
         fullPath: `${PRODUCTION_BASE_URL}${NEXT_LIVESTREAMS_PATH}/${group.groupId}`,
      }),
      [group]
   );

   // console.log("-> streams", streams);
   return (
      <React.Fragment>
         <HeadWithMeta {...metaInfo} />

         <Container>
            <Grid container spacing={2}>
               {streams.map((stream) => {
                  const parsedStream = parseStreamDates(stream);
                  console.log("-> parsedStream", parsedStream);
                  return (
                     <Grid key={parsedStream.id} xs={12} sm={6} lg={4} item>
                        <GroupStreamCardV2
                           mobile={mobile}
                           groupData={group}
                           // listenToUpcoming={listenToUpcoming}
                           user={user}
                           userData={userData}
                           id={parsedStream.id}
                           livestream={parsedStream}
                        />
                     </Grid>
                  );
               })}
            </Grid>
         </Container>
      </React.Fragment>
   );
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
