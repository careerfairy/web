import React, { useCallback, useEffect, useMemo, useState } from "react";
import { store } from "pages/_app";
import { getServerSideGroup, serializeServerSideStream } from "util/serverUtil";
import { getResizedUrl } from "components/helperFunctions/HelperFunctions";
import { NEXT_LIVESTREAMS_PATH, PRODUCTION_BASE_URL } from "constants/routes";
import HeadWithMeta from "components/page/HeadWithMeta";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../../store/actions";
import { useFirestoreConnect } from "react-redux-firebase";
import useListenToGroupStreams from "../../../components/custom-hook/useGroupUpcomingStreams";
import { PAST_LIVESTREAMS_NAME } from "../../../data/constants/streamContants";
import ScrollToTop from "../../../components/views/common/ScrollToTop";
import EmbedBannerSection from "../../../components/views/NextLivestreams/emebed/EmbedBannerSection";
import StreamsSwipeableView from "../../../components/views/NextLivestreams/emebed/StreamsSwipeableView";

{/*TODO Example link for embedding here*/}
{/*TODO fix speaker info text overflow*/}
{/*<iframe frameBorder="0" height="600" src="https://personal-habib.web.app/next-livestreams/GXW3MtpTehSmAe0aP1J4/embed" title="Events"/>*/}
const EmbeddedGroupStreamsPage = ({ serverSideGroup, groupId }) => {
   const {palette: {common: {white}, primary}} = useTheme()
   const [value, setValue] = useState("upcomingEvents");

   const [selectedOptions, setSelectedOptions] = useState([]);
   const currentGroup = useSelector(state => state.firestore.data[`group ${serverSideGroup.groupId}`] || serverSideGroup)
   const dispatch = useDispatch()

   useEffect(() => {
      dispatch(actions.closeNextLivestreamsFilter())
   }, [currentGroup.groupId])

   useFirestoreConnect(() => [{
      collection: "careerCenterData",
      doc: currentGroup.groupId,
      storeAs: "currentGroup"
   }])
   const upcomingLivestreams = useListenToGroupStreams(undefined, currentGroup.groupId, selectedOptions)
   const pastLivestreams = useListenToGroupStreams(undefined, currentGroup.groupId, selectedOptions, PAST_LIVESTREAMS_NAME)

   useEffect(() => {
      // Only find tab with streams if there isn't a livestreamId in query
         (function handleFindTabWithStreams() {
            if (!upcomingLivestreams?.length && pastLivestreams?.length) {
               setPastEvents()
            } else {
               setUpcomingEvents()
            }
         })();
   }, [Boolean(upcomingLivestreams), Boolean(pastLivestreams), currentGroup.groupId])

   const setPastEvents = () => setValue("pastEvents")
   const setUpcomingEvents = () => setValue("upcomingEvents")


   const metaInfo = useMemo( () => ({
      description: currentGroup.description,
      title: `CareerFairy | Next Livestreams of ${currentGroup.universityName}`,
      image: getResizedUrl(currentGroup.logoUrl, "lg"),
      fullPath: `${PRODUCTION_BASE_URL}${NEXT_LIVESTREAMS_PATH}/${currentGroup.groupId}`,
   }), [currentGroup])

   const handleChange = useCallback((event, newValue) => {
      setValue(newValue);
   }, []);

   return (
     <React.Fragment>
       <HeadWithMeta {...metaInfo} />
       <div>
         <EmbedBannerSection
           tabsColor={primary.dark}
           backgroundColor={"transparent"}
           // title={`CareerFairy Events of ${currentGroup.universityName}`}
           handleChange={handleChange}
           value={value}
         />
         <StreamsSwipeableView
           value={value}
           upcomingLivestreams={upcomingLivestreams}
           setSelectedOptions={setSelectedOptions}
           selectedOptions={selectedOptions}
           currentGroup={currentGroup}
           pastLivestreams={pastLivestreams}
         />
       </div>
       <ScrollToTop size="small" />
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
      props: { serverSideGroup: serverSideGroup, streams: groupStreams, groupId },
   };
}

export default EmbeddedGroupStreamsPage;
