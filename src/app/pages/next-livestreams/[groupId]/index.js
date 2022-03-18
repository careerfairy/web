import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import NextLivestreamsLayout from "layouts/NextLivestreamsLayout";
import GroupBannerSection from "components/views/NextLivestreams/GroupBannerSection";
import useListenToGroupStreams from "components/custom-hook/useGroupUpcomingStreams";
import { useFirestoreConnect } from "react-redux-firebase";
import { PAST_LIVESTREAMS_NAME } from "data/constants/streamContants";
import HeadWithMeta from "components/page/HeadWithMeta";
import { NEXT_LIVESTREAMS_PATH, PRODUCTION_BASE_URL } from "constants/routes";
import { StreamsSection } from "components/views/NextLivestreams/StreamsSection";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { getServerSideGroup, getServerSideStream } from "util/serverUtil";
import { getResizedUrl } from "components/helperFunctions/HelperFunctions";
import ScrollToTop from "components/views/common/ScrollToTop";
import { placeholderBanner } from "../../../constants/images";

const GroupPage = ({
   serverSideGroup,
   livestreamId,
   serverSideStream,
   initialTabValue,
}) => {
   const {
      palette: {
         common: { white },
         navyBlue,
      },
   } = useTheme();
   const [value, setValue] = useState(initialTabValue || "upcomingEvents");

   const [selectedOptions, setSelectedOptions] = useState([]);
   const currentGroup = useSelector(
      (state) =>
         state.firestore.data[`group ${serverSideGroup.groupId}`] ||
         serverSideGroup
   );
   const dispatch = useDispatch();

   useEffect(() => {
      dispatch(actions.closeNextLivestreamsFilter());
   }, [currentGroup.groupId]);

   useFirestoreConnect(() => [
      {
         collection: "careerCenterData",
         doc: currentGroup.groupId,
         storeAs: "currentGroup",
      },
   ]);
   const upcomingLivestreams = useListenToGroupStreams(
      livestreamId,
      currentGroup.groupId,
      selectedOptions
   );
   const pastLivestreams = useListenToGroupStreams(
      livestreamId,
      currentGroup.groupId,
      selectedOptions,
      PAST_LIVESTREAMS_NAME
   );

   useEffect(() => {
      (function handleFindHighlightedStreamTab() {
         if (livestreamIdIsIn(upcomingLivestreams)) {
            setUpcomingEvents();
         } else if (livestreamIdIsIn(pastLivestreams)) {
            setPastEvents();
         }
      })();
   }, [livestreamId, Boolean(upcomingLivestreams), Boolean(pastLivestreams)]);

   useEffect(() => {
      if (initialTabValue) {
         return;
      }
      if (!livestreamId) {
         // Only find tab with streams if there isn't a livestreamId in query
         (function handleFindTabWithStreams() {
            if (!upcomingLivestreams?.length && pastLivestreams?.length) {
               setPastEvents();
            } else {
               setUpcomingEvents();
            }
         })();
      }
   }, [
      Boolean(upcomingLivestreams),
      Boolean(pastLivestreams),
      currentGroup.groupId,
   ]);

   const setPastEvents = () => setValue("pastEvents");
   const setUpcomingEvents = () => setValue("upcomingEvents");

   const livestreamIdIsIn = (streams) => {
      return Boolean(streams?.some((stream) => stream.id === livestreamId));
   };

   const metaInfo = useMemo(
      () =>
         serverSideStream
            ? {
                 title: `CareerFairy | Live Stream with ${serverSideStream.company}`,
                 description: serverSideStream.title,
                 image: getResizedUrl(
                    serverSideStream.backgroundImageUrl,
                    "lg"
                 ),
                 fullPath: `${PRODUCTION_BASE_URL}${NEXT_LIVESTREAMS_PATH}/${currentGroup.groupId}?livestreamId=${serverSideStream.id}`,
              }
            : {
                 description: currentGroup.description,
                 title: `CareerFairy | Next Livestreams of ${currentGroup.universityName}`,
                 image: getResizedUrl(currentGroup.logoUrl, "lg"),
                 fullPath: `${PRODUCTION_BASE_URL}${NEXT_LIVESTREAMS_PATH}/${currentGroup.groupId}`,
              },
      [serverSideStream]
   );

   const handleChange = useCallback((event, newValue) => {
      setValue(newValue);
   }, []);

   return (
      <React.Fragment>
         <HeadWithMeta {...metaInfo} />
         <NextLivestreamsLayout currentGroup={currentGroup}>
            <div>
               <GroupBannerSection
                  color={white}
                  tabsColor={white}
                  backgroundImageClassName=""
                  backgroundColor={navyBlue.main}
                  groupLogo={currentGroup.logoUrl}
                  backgroundImage={
                     getResizedUrl(currentGroup.bannerImageUrl, "lg") ||
                     placeholderBanner
                  }
                  groupBio={currentGroup.extraInfo}
                  backgroundImageOpacity={0.8}
                  title={currentGroup.universityName}
                  subtitle={currentGroup.description}
                  handleChange={handleChange}
                  value={value}
               />
               <StreamsSection
                  value={value}
                  upcomingLivestreams={upcomingLivestreams}
                  livestreamId={livestreamId}
                  setSelectedOptions={setSelectedOptions}
                  selectedOptions={selectedOptions}
                  currentGroup={currentGroup}
                  pastLivestreams={pastLivestreams}
               />
            </div>
         </NextLivestreamsLayout>
         <ScrollToTop />
      </React.Fragment>
   );
};

export async function getServerSideProps({
   params: { groupId },
   query: { livestreamId, type },
}) {
   const serverSideStream = await getServerSideStream(livestreamId);
   const serverSideGroup = await getServerSideGroup(groupId);

   if (!serverSideGroup || Object.keys(serverSideGroup)?.length === 0) {
      return {
         notFound: true,
      };
   }

   let initialTabValue = null;
   if (type === "upcomingEvents" || type === "pastEvents") {
      initialTabValue = type;
   }
   return {
      props: {
         serverSideGroup,
         livestreamId: livestreamId || "",
         serverSideStream,
         initialTabValue,
      }, // will be passed to the page component as props
   };
}

export default GroupPage;
