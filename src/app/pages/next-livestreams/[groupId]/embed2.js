import React, { useCallback, useEffect, useMemo, useState } from "react";
import { store } from "pages/_app";
import { getServerSideGroup, serializeServerSideStream } from "util/serverUtil";
import { getResizedUrl } from "components/helperFunctions/HelperFunctions";
import { NEXT_LIVESTREAMS_PATH, PRODUCTION_BASE_URL } from "constants/routes";
import HeadWithMeta from "components/page/HeadWithMeta";
import { useTheme } from "@material-ui/core/styles";
import GroupBannerSection from "../../../components/views/NextLivestreams/GroupBannerSection";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../../store/actions";
import { useFirestoreConnect } from "react-redux-firebase";
import useListenToGroupStreams from "../../../components/custom-hook/useGroupUpcomingStreams";
import { PAST_LIVESTREAMS_NAME } from "../../../data/constants/streamContants";
import NextLivestreamsLayout from "../../../layouts/NextLivestreamsLayout";
import { StreamsSection } from "../../../components/views/NextLivestreams/StreamsSection";
import ScrollToTop from "../../../components/views/common/ScrollToTop";

const placeholderBanner =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-banners%2Fdefault-banner.svg?alt=media&token=9c53d78f-8f4d-420a-b5ef-36a8fd1c1ee0";

const EmbeddedGroupStreamsPage = ({ serverSideGroup, groupId }) => {
   const {palette: {common: {white}, navyBlue}} = useTheme()
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
        <HeadWithMeta
          {...metaInfo}
        />
           <div>
              <GroupBannerSection
                color={white}
                backgroundImageClassName=""
                backgroundColor={navyBlue.main}
                groupLogo={currentGroup.logoUrl}
                backgroundImage={placeholderBanner}
                groupBio={currentGroup.extraInfo}
                backgroundImageOpacity={0.2}
                title={currentGroup.universityName}
                subtitle={currentGroup.description}
                handleChange={handleChange}
                value={value}
              />
              <StreamsSection
                value={value}
                upcomingLivestreams={upcomingLivestreams}
                setSelectedOptions={setSelectedOptions}
                selectedOptions={selectedOptions}
                currentGroup={currentGroup}
                pastLivestreams={pastLivestreams}
              />
           </div>
        <ScrollToTop size="small"/>
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
