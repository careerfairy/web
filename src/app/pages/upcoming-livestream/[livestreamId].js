import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import RegistrationModal from "../../components/views/common/registration-modal";
import AboutSection from "../../components/views/upcoming-livestream/AboutSection";
import QuestionsSection from "../../components/views/upcoming-livestream/QuestionsSection";
import useInfiniteScrollServer from "../../components/custom-hook/useInfiniteScrollServer";
import SpeakersSection from "../../components/views/upcoming-livestream/SpeakersSection";

const UpcomingLivestreamPage = ({ serverStream }) => {
   const [stream, setStream] = useState(parseStreamDates(serverStream));
   const [registered, setRegistered] = useState(false);
   const { push, asPath, query, pathname } = useRouter();
   const [currentGroup, setCurrentGroup] = useState(null);
   const [joinGroupModalData, setJoinGroupModalData] = useState(undefined);
   const [filteredGroups, setFilteredGroups] = useState([]);
   const [targetGroupId, setTargetGroupId] = useState("");
   const [questionSortType, setQuestionSortType] = useState("timestamp");

   const [unfilteredGroups, setUnfilteredGroups] = useState([]);

   const handleCloseJoinModal = () => setJoinGroupModalData(undefined);
   const handleOpenJoinModal = useCallback(
      (dataObj) =>
         setJoinGroupModalData({
            groups: dataObj.groups,
            targetGroupId: targetGroupId,
            livestream: dataObj.livestream,
         }),
      [targetGroupId]
   );

   const [isPastEvent, setIsPastEvent] = useState(
      streamIsOld(stream?.startDate)
   );
   const { authenticatedUser, userData } = useAuth();

   const {
      listenToScheduledLivestreamById,
      deregisterFromLivestream,
      listenToCareerCenterById,
      getDetailLivestreamCareerCenters,
      livestreamQuestionsQuery,
      upvoteLivestreamQuestion,
   } = useFirebase();

   const questionsQuery = useMemo(
      () => stream && livestreamQuestionsQuery(stream.id, questionSortType),
      [stream?.id, questionSortType]
   );

   const handlers = useInfiniteScrollServer({
      limit: 8,
      query: questionsQuery,
   });

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
      if (query.groupId) {
         const unsubscribe = listenToCareerCenterById(
            query.groupId,
            (querySnapshot) => {
               setCurrentGroup({
                  ...querySnapshot.data(),
                  id: querySnapshot.id,
               });
            }
         );
         return () => unsubscribe();
      }
   }, [query.groupId]);

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
               const groupList = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
               }));

               let targetGroupId = currentGroup?.groupId;

               if (!targetGroupId) {
                  const companyThatPublishedStream = groupList.find(
                     (group) =>
                        !group.universityCode &&
                        group.id === stream?.author?.groupId
                  );
                  // TODO Dont think including the publishing company as the default group
                  //  if none is provided to be the best choice
                  if (companyThatPublishedStream?.id) {
                     targetGroupId = companyThatPublishedStream.id;
                  }
               }
               const targetGroup = groupList.find(
                  (group) => group.id === targetGroupId
               );
               setTargetGroupId(targetGroup?.id);
               setFilteredGroups(targetGroup ? [targetGroup] : groupList);
               setUnfilteredGroups(groupList);
            }
         );
      }
   }, [stream?.groupIds, currentGroup?.groupId]);

   useEffect(() => {
      if (
         query.register === stream?.id &&
         filteredGroups.length &&
         !stream?.registeredUsers.includes(authenticatedUser.email)
      ) {
         (async function handleAutoRegister() {
            const newQuery = { ...query };
            if (newQuery.register) {
               delete newQuery.register;
            }
            await push({
               pathname,
               query: {
                  ...newQuery,
               },
            });
            handleOpenJoinModal({
               groups: unfilteredGroups,
               livestream: stream,
            });
         })();
      }
   }, [
      query.register,
      stream?.id,
      filteredGroups,
      stream?.registeredUsers,
      authenticatedUser.email,
   ]);

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
         groups: unfilteredGroups,
         livestream: stream,
      });
   };

   const handleRegisterClick = () => {
      if (!registered) {
         return startRegistrationProcess(stream.id);
      }
   };

   const handleChangeQuestionSortType = (event, newSortType) => {
      if (newSortType !== null) {
         setQuestionSortType(newSortType);
      }
   };

   const handleUpvote = async (question) => {
      if (!authenticatedUser) {
         return push("/signup");
      }
      try {
         await upvoteLivestreamQuestion(
            stream.id,
            question,
            authenticatedUser.email
         );

         handlers.handleClientUpdate(question.id, {
            votes: question.votes + 1 || 1,
            emailOfVoters: question.emailOfVoters?.concat(
               authenticatedUser.email
            ) || [authenticatedUser.email],
         });
      } catch (e) {}
   };

   function hasVoted(question) {
      if (!authenticatedUser || !question.emailOfVoters) {
         return false;
      }
      return question.emailOfVoters.indexOf(authenticatedUser.email) > -1;
   }

   return (
      <UpcomingLayout>
         <HeadWithMeta
            {...getStreamMetaInfo({ stream, groupId: query.groupId })}
         />
         <HeroSection
            backgroundImage={getResizedUrl(stream.backgroundImageUrl, "md")}
            stream={stream}
            registerButtonLabel={registerButtonLabel}
            disabled={isRegistrationDisabled}
            registered={registered}
            hosts={filteredGroups}
            onRegisterClick={handleRegisterClick}
         />
         <SpeakersSection
            title="The speakers of this event"
            overheadText={"OUR SPEAKERS"}
            speakers={stream.speakers}
         />
         <AboutSection
            summary={stream.summary}
            title={`${stream.company}`}
            overheadText={"ABOUT"}
         />
         <QuestionsSection
            livestreamId={stream.id}
            title={`Have any questions for the speakers?`}
            handleChangeQuestionSortType={handleChangeQuestionSortType}
            getMore={handlers.getMore}
            loadingInitialQuestions={handlers.loadingInitial}
            hasVoted={hasVoted}
            hasMore={handlers.hasMore}
            reFetchQuestions={handlers.getInitialQuery}
            handleUpvote={handleUpvote}
            questions={handlers.docs}
            questionSortType={questionSortType}
         />

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

   // TODO check if groupId is part of stream.groupIds
   return {
      props: { serverStream, groupId: groupId || null }, // will be passed to the page component as props
   };
}

export default UpcomingLivestreamPage;
