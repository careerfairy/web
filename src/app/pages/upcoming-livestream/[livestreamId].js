import React, {
   useCallback,
   useEffect,
   useMemo,
   useState,
   useRef,
} from "react";
import { getServerSideStream, parseStreamDates } from "../../util/serverUtil";
import HeadWithMeta from "../../components/page/HeadWithMeta";
import { getStreamMetaInfo } from "../../util/SeoUtil";
import UpcomingLayout from "../../layouts/UpcomingLayout";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import { getResizedUrl } from "../../components/helperFunctions/HelperFunctions";
import HeroSection from "../../components/views/upcoming-livestream/HeroSection";
import { useAuth } from "../../HOCs/AuthProvider";
import { dateIsInUnder24Hours, streamIsOld } from "../../util/CommonUtil";
import UserUtil from "../../data/util/UserUtil";
import { useRouter } from "next/router";
import RegistrationModal from "../../components/views/common/registration-modal";
import AboutSection from "../../components/views/upcoming-livestream/AboutSection";
import QuestionsSection from "../../components/views/upcoming-livestream/QuestionsSection";
import useInfiniteScrollServer from "../../components/custom-hook/useInfiniteScrollServer";
import SpeakersSection from "../../components/views/upcoming-livestream/SpeakersSection";
import TalentPoolSection from "../../components/views/upcoming-livestream/TalentPoolSection";
import { useTheme } from "@material-ui/core/styles";
import ContactSection from "../../components/views/upcoming-livestream/ContactSection";
import Navigation from "../../components/views/upcoming-livestream/Navigation";
import { useMediaQuery } from "@material-ui/core";

const UpcomingLivestreamPage = ({ serverStream }) => {
   const aboutRef = useRef(null);
   const speakersRef = useRef(null);
   const questionsRef = useRef(null);

   const theme = useTheme();
   const mobile = useMediaQuery(theme.breakpoints.down("sm"));

   const [stream, setStream] = useState(parseStreamDates(serverStream));
   const [registered, setRegistered] = useState(false);
   const { push, asPath, query, pathname, replace } = useRouter();
   const [currentGroup, setCurrentGroup] = useState(null);
   const [joinGroupModalData, setJoinGroupModalData] = useState(undefined);
   const [filteredGroups, setFilteredGroups] = useState([]);
   const [targetGroupId, setTargetGroupId] = useState("");
   const [questionSortType, setQuestionSortType] = useState("timestamp");
   const [targetOptions, setTargetOptions] = useState([]);

   const [unfilteredGroups, setUnfilteredGroups] = useState([]);

   const { authenticatedUser, userData, isLoggedOut } = useAuth();
   const handleCloseJoinModal = () => setJoinGroupModalData(undefined);
   const handleOpenJoinModal = useCallback(
      (dataObj) =>
         setJoinGroupModalData({
            groups: dataObj.groups,
            targetGroupId: targetGroupId,
            livestream: dataObj.livestream,
         }),
      [targetGroupId, userData]
   );

   const [isPastEvent, setIsPastEvent] = useState(
      streamIsOld(stream?.startDate)
   );

   const {
      listenToScheduledLivestreamById,
      listenToCareerCenterById,
      getDetailLivestreamCareerCenters,
      livestreamQuestionsQuery,
      upvoteLivestreamQuestion,
   } = useFirebaseService();

   const questionsQuery = useMemo(
      () => stream && livestreamQuestionsQuery(stream.id, questionSortType),
      [stream?.id, questionSortType]
   );

   const handlers = useInfiniteScrollServer({
      limit: 8,
      query: questionsQuery,
   });

   useEffect(() => {
      window.scrollTo(0, 0);
   }, []);

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
      if (
         currentGroup &&
         currentGroup.categories &&
         stream &&
         stream.targetCategories
      ) {
         const { groupId, categories } = currentGroup;
         let totalOptions = [];
         categories.forEach((category) => totalOptions.push(category.options));
         const flattenedOptions = totalOptions.reduce(function (a, b) {
            return a.concat(b);
         }, []);
         const matchedOptions = stream.targetCategories[groupId];
         if (matchedOptions) {
            const filteredOptions = flattenedOptions.filter((option) =>
               matchedOptions.includes(option.id)
            );
            setTargetOptions(filteredOptions);
         }
      }
   }, [currentGroup, stream]);

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
         unfilteredGroups.length &&
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
      unfilteredGroups,
      stream?.registeredUsers,
      authenticatedUser.email,
   ]);

   useEffect(() => {
      if (stream.hasStarted) {
         replace?.(`/streaming/${stream.id}/viewer`);
      }
   }, [stream.hasStarted]);

   const registerButtonLabel = useMemo(() => {
      if (authenticatedUser && registered) return "You're booked";
      if (isPastEvent) return "The event is over";

      if (
         stream.maxRegistrants &&
         stream.maxRegistrants > 0 &&
         stream.registeredUsers &&
         stream.maxRegistrants <= stream.registeredUsers.length
      ) {
         return "No spots left";
      }
      if (authenticatedUser) {
         return "I'll attend";
      }
      return "Join to attend";
   }, [authenticatedUser, registered, stream, isPastEvent]);

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

   const numberOfSpotsRemaining = useMemo(() => {
      if (!stream.maxRegistrants) return 0;
      else if (!stream.registeredUsers) return stream.maxRegistrants;
      else {
         return stream.maxRegistrants - stream.registeredUsers.length;
      }
   });

   const streamAboutToStart = useMemo(() => {
      return Boolean(
         !isPastEvent &&
            !stream?.isFaceToFace &&
            dateIsInUnder24Hours(stream?.startDate)
      );
   }, [isPastEvent, stream?.isFaceToFace, stream?.startDate]);

   const startRegistrationProcess = async () => {
      if (isLoggedOut || !authenticatedUser.emailVerified) {
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
         return push({
            pathname: `/profile`,
            query: { absolutePath: asPath },
         });
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
      if (isLoggedOut) {
         return push({
            pathname: `/signup`,
            query: { absolutePath: asPath },
         });
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
            backgroundImage={getResizedUrl(stream.backgroundImageUrl, "lg")}
            stream={stream}
            streamAboutToStart={streamAboutToStart}
            registerButtonLabel={registerButtonLabel}
            disabled={isRegistrationDisabled}
            registered={registered}
            numberOfSpotsRemaining={numberOfSpotsRemaining}
            hosts={filteredGroups}
            onRegisterClick={handleRegisterClick}
         />
         <Navigation
            aboutRef={aboutRef}
            speakersRef={speakersRef}
            questionsRef={questionsRef}
         />
         {stream.summary && (
            <AboutSection
               summary={stream.summary}
               sectionRef={aboutRef}
               sectionId="about"
               title={`${stream.company}`}
               forceReveal={mobile}
               big
               overheadText={"ABOUT"}
            />
         )}
         {!!stream.speakers.length && (
            <SpeakersSection
               overheadText={"OUR SPEAKERS"}
               sectionRef={speakersRef}
               backgroundColor={theme.palette.common.white}
               sectionId="speakers"
               big
               speakers={stream.speakers}
            />
         )}

         <QuestionsSection
            livestreamId={stream.id}
            title={
               isPastEvent
                  ? "Questions that were asked"
                  : `Have any questions for the speakers?`
            }
            big
            handleChangeQuestionSortType={handleChangeQuestionSortType}
            getMore={handlers.getMore}
            loadingInitialQuestions={handlers.loadingInitial}
            hasVoted={hasVoted}
            sectionRef={questionsRef}
            isPastEvent={isPastEvent}
            sectionId="questions"
            hasMore={handlers.hasMore}
            reFetchQuestions={handlers.getInitialQuery}
            handleUpvote={handleUpvote}
            questions={handlers.docs}
            questionSortType={questionSortType}
         />
         {!stream.hasNoTalentPool && <TalentPoolSection stream={stream} />}
         <ContactSection
            subtitle={"Any problem or question ? We want to hear from you"}
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
