import React, { useEffect, useMemo, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { getServerSideStream, parseStreamDates } from "../../util/serverUtil";
import HeadWithMeta from "../../components/page/HeadWithMeta";
import { getStreamMetaInfo } from "../../util/SeoUtil";
import UpcomingLayout from "../../layouts/UpcomingLayout";
import { useFirebase } from "context/firebase";
import { getResizedUrl } from "../../components/helperFunctions/HelperFunctions";
import HeroSection from "../../components/views/upcoming-livestream/HeroSection";
import { useAuth } from "../../HOCs/AuthProvider";
import { streamIsOld } from "../../util/CommonUtil";
import UserUtil from "../../data/util/UserUtil";
import { useRouter } from "next/router";
import GroupsUtil from "../../data/util/GroupsUtil";
import RegistrationModal from "../../components/views/common/registration-modal";
import AboutSection from "../../components/views/upcoming-livestream/AboutSection";
import QuestionsSection from "../../components/views/upcoming-livestream/QuestionsSection";

const useStyles = makeStyles((theme) => ({
   root: {},
}));
const UpcomingLivestreamPage = ({ serverStream, groupId }) => {
   const [stream, setStream] = useState(parseStreamDates(serverStream));
   const [registered, setRegistered] = useState(false);
   const { push, asPath, query } = useRouter();
   const [careerCenters, setCareerCenters] = useState([]);
   const [currentGroup, setCurrentGroup] = useState(null);
   const [joinGroupModalData, setJoinGroupModalData] = useState(undefined);
   const handleCloseJoinModal = () => setJoinGroupModalData(undefined);
   const handleOpenJoinModal = (dataObj) =>
      setJoinGroupModalData({
         groups: dataObj.groups,
         livestream: dataObj.livestream,
      });

   const [isPastEvent, setIsPastEvent] = useState(
      streamIsOld(stream?.startDate)
   );
   const { authenticatedUser, userData } = useAuth();

   const {
      listenToScheduledLivestreamById,
      deregisterFromLivestream,
      listenToCareerCenterById,
      getDetailLivestreamCareerCenters,
   } = useFirebase();

   useEffect(() => {
      setIsPastEvent(streamIsOld(stream?.startDate));
   }, [stream?.startDate]);

   useEffect(() => {
      if (stream.id) {
         const unsubscribe = listenToScheduledLivestreamById(
            stream.id,
            (querySnapshot) => {
               if (querySnapshot.exists) {
                  const data = querySnapshot.data();
                  setStream({
                     ...data,
                     createdDate: data.created?.toDate?.(),
                     lastUpdatedDate: data.lastUpdated?.toDate?.(),
                     startDate: data.start?.toDate?.(),
                     id: querySnapshot.id,
                  });
               }
            }
         );
         return () => unsubscribe();
      }
   }, [stream?.id]);

   useEffect(() => {
      if (groupId) {
         const unsubscribe = listenToCareerCenterById(
            groupId,
            (querySnapshot) => {
               setCurrentGroup({
                  ...querySnapshot.data(),
                  id: querySnapshot.id,
               });
            }
         );
         return () => unsubscribe();
      }
   }, [groupId]);

   useEffect(() => {
      if (
         authenticatedUser &&
         stream?.registeredUsers?.includes(authenticatedUser.email)
      ) {
         setRegistered(true);
      } else {
         setRegistered(false);
      }
   }, [stream, authenticatedUser]);

   useEffect(() => {
      if (stream?.groupIds?.length) {
         getDetailLivestreamCareerCenters(stream.groupIds).then(
            (querySnapshot) => {
               let groupList = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
               }));

               let targetGroupId = currentGroup?.groupId;

               if (!groupId) {
                  const companyThatPublishedStream = groupList.find(
                     (group) =>
                        !group.universityCode &&
                        group.id === stream?.author?.groupId
                  );
                  if (companyThatPublishedStream?.id) {
                     targetGroupId = companyThatPublishedStream.id;
                  }
               }
               groupList = groupList.filter((careerCenter) =>
                  GroupsUtil.filterCurrentGroup(careerCenter, targetGroupId)
               );
               setCareerCenters(groupList);
            }
         );
      }
   }, [stream?.groupIds, currentGroup?.groupId]);

   const registerButtonLabel = useMemo(() => {
      if (authenticatedUser && registered) return "You're booked";
      if (
         stream.maxRegistrants &&
         stream.maxRegistrants > 0 &&
         stream.registeredUsers &&
         stream.maxRegistrants <= stream.registeredUsers.length
      ) {
         return "No spots left";
      } else if (authenticatedUser) {
         return "I'll attend";
      } else {
         return "Join to attend";
      }
   }, [authenticatedUser, registered, stream]);

   const isRegistrationDisabled = useMemo(() => {
      if (isPastEvent) return true;
      //User should always be able to cancel registration
      if (authenticatedUser && registered) return false;
      //Disable registration if max number of registrants is reached
      if (stream.maxRegistrants && stream.maxRegistrants > 0) {
         return stream.registeredUsers
            ? stream.maxRegistrants <= stream.registeredUsers.length
            : false;
      }
      return false;
   }, [isPastEvent, stream, authenticatedUser, registered]);

   const linkToStream = useMemo(() => {
      const notLoggedIn =
         (authenticatedUser.isLoaded && authenticatedUser.isEmpty) ||
         !authenticatedUser.emailVerified;
      const registerQuery = notLoggedIn ? `&register=${stream.id}` : "";
      const referrerQuery = query.referrerId
         ? `&referrerId=${query.referrerId}`
         : "";
      const groupIdQuery = query.groupId ? `&groupId=${query.groupId}` : "";
      const queries = `${registerQuery}${referrerQuery}${groupIdQuery}`;
      const basePath = `/upcoming-livestream/${stream.id}`;
      return queries ? `${basePath}?${queries}` : basePath;
   }, [asPath, stream?.id, query.groupId, authenticatedUser, query.referrerId]);

   const startRegistrationProcess = async () => {
      if (!authenticatedUser || !authenticatedUser.emailVerified) {
         return push(
            asPath
               ? {
                    pathname: `/login`,
                    query: { absolutePath: linkToStream },
                 }
               : "/signup"
         );
      }

      if (!userData || !UserUtil.userProfileIsComplete(userData)) {
         return push("/profile");
      }

      handleOpenJoinModal({
         groups: careerCenters,
         livestream: stream,
      });
   };

   const handleRegisterClick = () => {
      if (!registered) {
         return startRegistrationProcess(stream.id);
      }
   };

   const classes = useStyles();
   return (
      <UpcomingLayout>
         <HeadWithMeta {...getStreamMetaInfo({ stream, groupId })} />
         <HeroSection
            backgroundImage={getResizedUrl(stream.backgroundImageUrl, "md")}
            title={stream.title}
            speakers={stream.speakers}
            eventStartTime={stream.startDate}
            registerButtonLabel={registerButtonLabel}
            disabled={isRegistrationDisabled}
            registered={registered}
            onRegisterClick={handleRegisterClick}
         />
         <AboutSection
            summary={stream.summary}
            title={`${stream.company}`}
            overheadText={"ABOUT"}
         />
         <QuestionsSection title={`Have any questions for the speakers?`} />
         <RegistrationModal
            open={Boolean(joinGroupModalData)}
            onFinish={handleCloseJoinModal}
            promptOtherEventsOnFinal
            livestream={joinGroupModalData?.livestream}
            groups={joinGroupModalData?.groups}
         />
      </UpcomingLayout>
   );
};

export async function getServerSideProps({
   params: { livestreamId },
   query: { groupId },
}) {
   const serverStream = await getServerSideStream(livestreamId);

   return {
      props: { serverStream, groupId: groupId || null }, // will be passed to the page component as props
   };
}

export default UpcomingLivestreamPage;
