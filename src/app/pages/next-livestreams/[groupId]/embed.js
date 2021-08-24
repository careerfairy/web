import React, { useCallback, useMemo, useState } from "react";
import { store } from "pages/_app";
import {
   convertStreamJsDatesToTimestamps,
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
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { useFirebase } from "context/firebase";
import useInfiniteScrollClientWithHandlers from "../../../components/custom-hook/useInfiniteScrollClientWithHandlers";
import EmbedLayout from "../../../layouts/EmbedLayout";
import LazyLoad from "react-lazyload";
import Spinner from "../../../components/views/NextLivestreams/GroupStreams/groupStreamCard/Spinner";
import clsx from "clsx";
import GroupBannerSection from "../../../components/views/NextLivestreams/GroupBannerSection";
const placeholderBanner = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-banners%2Fdefault-banner.svg?alt=media&token=9c53d78f-8f4d-420a-b5ef-36a8fd1c1ee0"

const gridItemHeight = 530

const useStyles = makeStyles((theme) => ({
   root: {
      flex: 1,
      paddingTop: 0,
      display: "flex",
      flexDirection: "column",
   },
   followButton: {
      position: "sticky",
      top: 165,
      zIndex: 101,
      marginBottom: 14
   },
   emptyMessage: {
      maxWidth: "400px",
      margin: "0 auto",
      color: "rgb(130,130,130)"
   },
   loaderWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh"
   },
   streamGridItem: {
      height: gridItemHeight,
      display: "flex"
   },
   dynamicHeight: {
      height: "auto"
   }
}));

const Wrapper = ({children, streamId}) => {

   return (
     <LazyLoad
       style={{flex: 1, display: "flex", width: "-webkit-fill-available"}}
       key={streamId}
       height={gridItemHeight}
       // unmountIfInvisible
       scroll
       offset={[0, 0]}
       placeholder={<Spinner/>}>
        {children}
     </LazyLoad>
   )
}

const EmbeddedGroupStreamsPage = ({ group, streams, groupId }) => {
   const handleStreamDates = (serverSideStream) => {
      const parsedStream = parseStreamDates(serverSideStream);
      const streamWithTimestamp = convertStreamJsDatesToTimestamps(
        parsedStream,
        convertJsDateToTimestamp
      );
      return convertStreamJsDatesToTimestamps(
        streamWithTimestamp,
        convertJsDateToTimestamp
      );
   };

   const { userData, authenticatedUser: user } = useAuth();
   const theme = useTheme();
   const classes = useStyles()
   const {palette: {common: {white}, navyBlue}} = useTheme()

   const mobile = useMediaQuery(theme.breakpoints.down("sm"));
   const { convertJsDateToTimestamp } = useFirebase();
   const [value, setValue] = useState("upcomingEvents");

   const [totalStreams, setTotalStreams] = useState(streams.map(stream => handleStreamDates(stream)));
   // console.log("-> totalStreams", totalStreams);
   const [slicedLivestreams] = useInfiniteScrollClientWithHandlers(totalStreams, 6, 3);
   console.log("-> slicedLivestreams", slicedLivestreams);

   const handleChange = useCallback((event, newValue) => {
      setValue(newValue);
   }, []);

   const metaInfo = useMemo(
      () => ({
         description: group.description,
         title: `CareerFairy | Next Livestreams of ${group.universityName}`,
         image: getResizedUrl(group.logoUrl, "lg"),
         fullPath: `${PRODUCTION_BASE_URL}${NEXT_LIVESTREAMS_PATH}/${group.groupId}`,
      }),
      [group]
   );

   return (
     <React.Fragment>
        <GroupBannerSection
          color={white}
          backgroundImageClassName=""
          backgroundColor={navyBlue.main}
          groupLogo={group.logoUrl}
          backgroundImage={placeholderBanner}
          groupBio={group.extraInfo}
          backgroundImageOpacity={0.2}
          title={group.universityName}
          subtitle={group.description}
          handleChange={handleChange}
          value={value}
        />
     </React.Fragment>
   )

   // return <div>
   //    hi
   // </div>

   return (
      <React.Fragment>
         {/*<EmbedLayout>*/}
         <HeadWithMeta {...metaInfo} />
         <Container >
            <Grid container spacing={2}>
               {slicedLivestreams.map((stream, index) => {
                  return (
                     <Grid
                       className={clsx(classes.streamGridItem, {
                          [classes.dynamicHeight]: mobile
                       })}
                       key={stream.id} xs={12} sm={6} lg={4} item>
                        <Wrapper
                          index={index}
                          streamId={stream.id}
                        >
                        <GroupStreamCardV2
                           mobile={mobile}
                           groupData={group}
                           user={user}
                           userData={userData}
                           id={stream.id}
                           livestream={stream}
                        />
                        </Wrapper>
                     </Grid>
                  );
               })}
            </Grid>
         </Container>
         {/*</EmbedLayout>*/}
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
