import React, { useEffect, useRef, useState } from "react";
import { Button, Container, TextField, Grid, Hidden } from "@material-ui/core";
import Header from "../../components/views/header/Header";
import SettingsIcon from "@material-ui/icons/Settings";
import { withFirebasePage } from "context/firebase";
import AddIcon from "@material-ui/icons/Add";
import Loader from "../../components/views/loader/Loader";
import DateUtil from "../../util/DateUtil";
import { useRouter } from "next/router";
import Footer from "../../components/views/footer/Footer";
import Countdown from "../../components/views/common/Countdown";
import BookingModal from "../../components/views/common/booking-modal/BookingModal";
import QuestionVotingBox from "../../components/views/question-voting-box/QuestionVotingBox";
import StringUtils from "../../util/StringUtils";
import ClearIcon from "@material-ui/icons/Clear";
import UserUtil from "../../data/util/UserUtil";
import TargetOptions from "../../components/views/common/TargetOptions";
import GroupJoinToAttendModal from "components/views/NextLivestreams/GroupStreams/GroupJoinToAttendModal";
import DataAccessUtil from "util/DataAccessUtil";
import HowToRegRoundedIcon from "@material-ui/icons/HowToRegRounded";
import EmailIcon from "@material-ui/icons/Email";
import RssFeedIcon from "@material-ui/icons/RssFeed";
import DateRangeIcon from "@material-ui/icons/DateRange";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { makeStyles } from "@material-ui/core/styles";
import { speakerPlaceholder } from "../../components/util/constants";
import { useAuth } from "../../HOCs/AuthProvider";
import GroupsUtil from "../../data/util/GroupsUtil";
import { store } from "../_app";
import { Paper, Avatar, Box } from "@material-ui/core";
import { companyLogoPlaceholder } from "../../constants/images";
import { getResizedUrl } from "../../components/helperFunctions/HelperFunctions";
import HeadWithMeta from "../../components/page/HeadWithMeta";
import Typography from "@material-ui/core/Typography";
import JoinTalentPoolModal from "../../components/views/common/join-talent-pool-modal/JoinTalentPoolModal";
import LinkifyText from "../../components/util/LinkifyText";

const useStyles = makeStyles((theme) => ({
   speakerAvatar: {
      width: 110,
      height: 110,
      boxShadow: theme.shadows[6],
   },
   speakerWrapper: {
      display: "flex !important",
      flexDirection: "column !important",
      alignItems: "center !important",
   },
   logoWrapper: {
      padding: theme.spacing(2),
   },
   input: {
      background: theme.palette.background.paper,
   },
}));

const parseDates = (stream) => {
   if (stream.createdDateString) {
      stream.createdDate = new Date(Date.parse(stream.createdDateString));
   }
   if (stream.lastUpdatedDateString) {
      stream.lastUpdatedDate = new Date(
         Date.parse(stream.lastUpdatedDateString)
      );
   }
   if (stream.startDateString) {
      stream.startDate = new Date(Date.parse(stream.startDateString));
   }
   return stream;
};

function UpcomingLivestream({ firebase, serverSideLivestream, groupId }) {
   // console.count("-> UpcomingLivestream");
   const classes = useStyles();
   const router = useRouter();
   const { livestreamId } = router.query;
   const absolutePath = router.asPath;
   const summaryRef = useRef();
   const { userData, authenticatedUser: user } = useAuth();
   const [upcomingQuestions, setUpcomingQuestions] = useState([]);
   const [newQuestionTitle, setNewQuestionTitle] = useState("");
   const [currentLivestream, setCurrentLivestream] = useState(
      parseDates(serverSideLivestream)
   );
   const [registration, setRegistration] = useState(false);

   const [userIsInTalentPool, setUserIsInTalentPool] = useState(false);
   const [registered, setRegistered] = useState(false);
   const [groupsWithPolicies, setGroupsWithPolicies] = useState([]);
   const [bookingModalOpen, setBookingModalOpen] = useState(false);
   const [careerCenters, setCareerCenters] = useState([]);
   const [currentGroup, setCurrentGroup] = useState(null);
   const [targetOptions, setTargetOptions] = useState([]);

   const [openJoinModal, setOpenJoinModal] = useState(false);
   const [openTalentPoolModal, setOpenTalentPoolModal] = useState(false);
   const [isPastEvent, setIsPastEvent] = useState(
      dateIsHasPassed(currentLivestream?.startDate)
   );
   console.log("-> isPastEvent", isPastEvent);

   useEffect(() => {
      // Checks if the event is old and has a summary,
      // if so the browser will scroll to the summary
      // on mount only.
      if(isPastEvent && currentLivestream?.summary){
         window.scrollTo({
            behavior: "smooth",
            top: summaryRef.current?.offsetTop - 100
         });
      }
   },[])
   useEffect(() => {
      setIsPastEvent(dateIsHasPassed(currentLivestream?.startDate));
   }, [currentLivestream?.startDate]);

   useEffect(() => {
      if (livestreamId) {
         const unsubscribe = firebase.listenToLivestreamQuestions(
            livestreamId,
            (querySnapshot) => {
               var questionsList = [];
               querySnapshot.forEach((doc) => {
                  let question = doc.data();
                  question.id = doc.id;
                  questionsList.push(question);
               });
               setUpcomingQuestions(questionsList);
            }
         );
         return () => unsubscribe();
      }
   }, [livestreamId, user]);

   useEffect(() => {
      if (groupId) {
         const unsubscribe = firebase.listenToCareerCenterById(
            groupId,
            (querySnapshot) => {
               let group = querySnapshot.data();
               group.id = querySnapshot.id;
               setCurrentGroup(group);
            }
         );
         return () => unsubscribe();
      }
   }, [groupId]);

   useEffect(() => {
      if (livestreamId) {
         const unsubscribe = firebase.listenToScheduledLivestreamById(
            livestreamId,
            (querySnapshot) => {
               if (querySnapshot.data()) {
                  let livestream = querySnapshot.data();
                  livestream.createdDate = livestream.created?.toDate?.();
                  livestream.lastUpdatedDate = livestream.lastUpdated?.toDate?.();
                  livestream.startDate = livestream.start?.toDate?.();
                  livestream.id = querySnapshot.id;
                  setCurrentLivestream(livestream);
               }
            }
         );
         return () => unsubscribe();
      }
   }, [livestreamId]);

   useEffect(() => {
      if (
         user &&
         currentLivestream &&
         currentLivestream.registeredUsers &&
         currentLivestream.registeredUsers.indexOf(user.email) > -1
      ) {
         setRegistered(true);
      } else {
         setRegistered(false);
      }
   }, [currentLivestream, user]);

   useEffect(() => {
      if (
         currentGroup &&
         currentGroup.categories &&
         currentLivestream &&
         currentLivestream.targetCategories
      ) {
         const { groupId, categories } = currentGroup;
         let totalOptions = [];
         categories.forEach((category) => totalOptions.push(category.options));
         const flattenedOptions = totalOptions.reduce(function (a, b) {
            return a.concat(b);
         }, []);
         const matchedOptions = currentLivestream.targetCategories[groupId];
         if (matchedOptions) {
            const filteredOptions = flattenedOptions.filter((option) =>
               matchedOptions.includes(option.id)
            );
            setTargetOptions(filteredOptions);
         }
      }
   }, [currentGroup, currentLivestream]);

   useEffect(() => {
      if (
         currentLivestream &&
         currentLivestream.groupIds &&
         currentLivestream.groupIds.length
      ) {
         firebase
            .getDetailLivestreamCareerCenters(currentLivestream.groupIds)
            .then((querySnapshot) => {
               let groupList = [];
               querySnapshot.forEach((doc) => {
                  let group = doc.data();
                  group.id = doc.id;
                  groupList.push(group);
               });
               setCareerCenters(groupList);
            });
      }
   }, [currentLivestream]);

   useEffect(() => {
      if (
         userData &&
         currentLivestream &&
         userData.talentPools &&
         userData.talentPools.indexOf(currentLivestream.companyId) > -1
      ) {
         setUserIsInTalentPool(true);
      } else {
         setUserIsInTalentPool(false);
      }
   }, [currentLivestream, userData]);

   useEffect(() => {
      if (currentLivestream.hasStarted) {
         router.replace?.("/streaming/" + currentLivestream.id + "/viewer");
      }
   }, [currentLivestream.hasStarted]);

   function goToSeparateRoute(route) {
      window.open("http://careerfairy.io" + route, "_blank");
   }

   function deregisterFromLivestream() {
      if (!user || !user.emailVerified) {
         return router.replace("/signup");
      }

      if (!userData) {
         return router.push("/profile");
      }

      firebase.deregisterFromLivestream(currentLivestream.id, user.email);
   }

   function joinTalentPool() {
      if (!user || !user.emailVerified) {
         return router.replace("/signup");
      }

      if (!userData || !UserUtil.userProfileIsComplete(userData)) {
         return router.push("/profile");
      }

      firebase.joinCompanyTalentPool(
         currentLivestream.companyId,
         user.email,
         currentLivestream.id
      );
   }

   function leaveTalentPool() {
      if (!user || !user.emailVerified) {
         return router.replace("/signup");
      }

      if (!userData || !UserUtil.userProfileIsComplete(userData)) {
         return router.push("/profile");
      }

      firebase.leaveCompanyTalentPool(
         currentLivestream.companyId,
         user.email,
         currentLivestream.id
      );
   }

   function userIsRegistered() {
      if (!user || !currentLivestream.registeredUsers) {
         return false;
      }
      return currentLivestream.registeredUsers.indexOf(user.email) > -1;
   }

   function sendEmailRegistrationConfirmation() {
      return DataAccessUtil.sendRegistrationConfirmationEmail(
         user,
         userData,
         currentLivestream
      );
   }

   function userFollowsSomeCareerCenter() {
      return userData.groupIds?.some((groupId) => {
         return careerCenters.some((careerCenter) => {
            return careerCenter.groupId === groupId;
         });
      });
   }

   const startRegistrationProcess = async (livestreamId) => {
      if (!user || !user.emailVerified) {
         return router.push(
            absolutePath
               ? {
                    pathname: `/login`,
                    query: { absolutePath },
                 }
               : "/signup"
         );
      }

      if (!userData || !UserUtil.userProfileIsComplete(userData)) {
         return router.push("/profile");
      }

      const {
         hasAgreedToAll,
         groupsWithPolicies,
      } = await GroupsUtil.getPolicyStatus(careerCenters, user.email, firebase);
      if (!hasAgreedToAll) {
         setOpenJoinModal(true);
         setGroupsWithPolicies(groupsWithPolicies);
      } else if (careerCenters.length > 0 && !userFollowsSomeCareerCenter()) {
         setOpenJoinModal(true);
      } else {
         setBookingModalOpen(true);
         setRegistration(true);
         firebase
            .registerToLivestream(
               currentLivestream.id,
               user.email,
               groupsWithPolicies
            )
            .then(() => {
               sendEmailRegistrationConfirmation();
               setRegistration(false);
            });
      }
   };

   function completeRegistrationProcess() {
      firebase
         .registerToLivestream(
            currentLivestream.id,
            user.email,
            groupsWithPolicies
         )
         .then(() => {
            setBookingModalOpen(true);
            sendEmailRegistrationConfirmation();
         });
   }

   function handleCloseJoinModal() {
      setOpenJoinModal(false);
   }

   function deregisterFromLivestream(livestreamId) {
      if (!user || !user.emailVerified) {
         return router.push("/signup");
      }

      if (!userData || !UserUtil.userProfileIsComplete(userData)) {
         return router.push("/profile");
      }

      firebase.deregisterFromLivestream(livestreamId, user.email);
   }

   function dateIsInUnder24Hours(date) {
      return (
         new Date(date).getTime() - Date.now() < 1000 * 60 * 60 * 24 ||
         Date.now() > new Date(date).getTime()
      );
   }

   /**
    * @param {number|string|VarDate|Date} date
    * @param {number} additionalMinutes - Amount of additional minutes to be added to current time
    */
   function dateIsHasPassed(date, additionalMinutes = 300) {
      return false
      // return (
      //   new Date(date).getTime() - Date.now() < 1000 * 60 * 60 * 24 ||
      //   Date.now() > new Date(date).getTime()
      // );
   }

   function addNewQuestion() {
      if (!user || !user.emailVerified) {
         return router.replace("/signup");
      }

      if (StringUtils.isEmpty(newQuestionTitle)) {
         return;
      }

      const newQuestion = {
         title: newQuestionTitle,
         votes: 0,
         type: "new",
         author: user.email,
      };

      firebase.putLivestreamQuestion(currentLivestream.id, newQuestion).then(
         () => {
            setNewQuestionTitle("");
         },
         () => {
            console.log("Error");
         }
      );
   }

   let speakerElements = currentLivestream?.speakers?.map((speaker, index) => {
      return (
         <Grid
            item
            xs={12}
            sm={8}
            md={4}
            className={classes.speakerWrapper}
            key={speaker.id}
         >
            <div className="livestream-speaker-avatar-capsule">
               <Avatar
                  src={
                     speaker?.avatar?.length
                        ? getResizedUrl(speaker.avatar, "sm")
                        : speakerPlaceholder
                  }
                  className={classes.speakerAvatar}
               />
            </div>
            <div className="livestream-speaker-description">
               <div
                  style={{
                     fontWeight: "700",
                     fontSize: "1.2em",
                     marginBottom: "10px",
                     color: userIsRegistered() ? "white" : "rgb(44, 66, 81)",
                  }}
               >
                  {speaker.firstName + " " + speaker.lastName}
               </div>
               <div
                  style={{
                     fontWeight: "700",
                     fontSize: "0.9em",
                     marginBottom: "5px",
                     color: userIsRegistered() ? "white" : "rgb(44, 66, 81)",
                  }}
               >
                  {speaker.position}
               </div>
               <div
                  style={{
                     fontWeight: "500",
                     fontSize: "0.9em",
                     marginBottom: "5px",
                     color: userIsRegistered() ? "white" : "rgb(140,140,140)",
                  }}
               >
                  {speaker.background}
               </div>
            </div>
            <style jsx>{`
               .livestream-speaker-avatar-capsule {
                  border: 2px solid rgb(0, 210, 170);
                  display: inline-block;
                  margin: 20px auto;
                  padding: 8px;
                  border-radius: 50%;
               }

               .livestream-speaker-avatar {
                  width: 110px;
                  padding-top: 110px;
                  border-radius: 50%;
                  vertical-align: middle;
                  display: inline-block;
                  box-shadow: 0 0 2px grey;
                  background-size: cover;
               }

               .livestream-speaker-description {
                  display: inline-block;
                  vertical-align: middle;
                  width: 100%;
                  text-align: center;
                  margin: 0 0 0 10px;
               }
            `}</style>
         </Grid>
      );
   });

   let questionElements = upcomingQuestions.map((question, index) => {
      return (
         <Grid item xs={12} sm={6} md={4} key={question.id || index}>
            <QuestionVotingBox
               question={question}
               user={user}
               livestream={currentLivestream}
            />
         </Grid>
      );
   });

   let logoElements = careerCenters.map((careerCenter, index) => {
      return (
         <Grid item xs={4} md={3} key={careerCenter.groupId}>
            <Paper
               className={classes.logoWrapper}
               justify="center"
               style={{ textAlign: "center" }}
            >
               <img
                  src={getResizedUrl(careerCenter.logoUrl, "md")}
                  style={{
                     maxHeight: "60px",
                     maxWidth: "250px",
                     width: "100%",
                     margin: "10px auto 5px auto",
                     objectFit: "contain",
                  }}
               />
            </Paper>
         </Grid>
      );
   });

   if (!currentLivestream.id) {
      return <Loader />;
   }

   return (
      <div>
         <div className="topLevelContainer">
            <HeadWithMeta
               title={`CareerFairy | Live Stream with ${currentLivestream.company}`}
               fullPath={
                  groupId
                     ? `https://careerfairy.io/upcoming-livestream/${livestreamId}?groupId=${groupId}`
                     : `https://careerfairy.io/upcoming-livestream/${livestreamId}`
               }
               image={getResizedUrl(currentLivestream.backgroundImageUrl, "sm")}
               description={currentLivestream.title}
            />
            <Header color="white" />
            <div
               className="video-mask"
               style={{
                  backgroundImage:
                     "url(" +
                     getResizedUrl(currentLivestream.backgroundImageUrl, "lg") +
                     ")",
               }}
            >
               <div
                  className="mask"
                  style={{
                     backgroundColor: userIsRegistered()
                        ? "rgba(0, 210, 170, 0.9)"
                        : "",
                  }}
               >
                  <Container>
                     <div
                        className="livestream-label"
                        style={{
                           color: userIsRegistered() ? "white" : "",
                           border: userIsRegistered() ? "2px solid white" : "",
                        }}
                     >
                        <RssFeedIcon
                           style={{ verticalAlign: "middle", marginRight: 5 }}
                        />
                        <span style={{ verticalAlign: "middle" }}>
                           Live stream
                        </span>
                     </div>
                     <div
                        className="livestream-title"
                        style={{ color: userIsRegistered() ? "white" : "" }}
                     >
                        {currentLivestream.title}
                     </div>
                     <div
                        className="livestream-date"
                        style={{ color: userIsRegistered() ? "white" : "" }}
                     >
                        <span>
                           <DateRangeIcon style={{ marginRight: 5 }} />
                           {DateUtil.getPrettyDate(currentLivestream.startDate)}
                        </span>
                     </div>
                     {!isPastEvent && (
                        <div
                           className={
                              "topDescriptionContainer " +
                              (dateIsInUnder24Hours(currentLivestream.startDate)
                                 ? ""
                                 : "hidden")
                           }
                        >
                           <div
                              className="countdown-title"
                              style={{
                                 textAlign: "center",
                                 color: "rgb(255, 20, 147)",
                                 fontSize: "1.4em",
                              }}
                           >
                              Please wait here! You will be redirected when the
                              stream starts.
                           </div>
                           <div
                              style={{
                                 textAlign: "center",
                                 color: "rgb(255, 20, 147)",
                              }}
                           >
                              <Countdown date={currentLivestream.startDate}>
                                 <span style={{ margin: "30px" }}>
                                    This livestream will start shortly
                                 </span>
                              </Countdown>
                           </div>
                        </div>
                     )}
                     <div style={{ margin: "50px 0" }}>
                        <Box>
                           <Paper
                              className={classes.logoWrapper}
                              style={{ maxWidth: 300, margin: "0 auto" }}
                           >
                              <img
                                 src={getResizedUrl(
                                    currentLivestream.companyLogoUrl,
                                    "md"
                                 )}
                                 style={{
                                    maxWidth: "230px",
                                    maxHeight: "140px",
                                    margin: "10px auto 5px auto",
                                 }}
                              />
                           </Paper>
                        </Box>
                        <Grid container justify="center" align="center">
                           {speakerElements}
                        </Grid>
                     </div>
                     <div style={{ margin: "40px 0", width: "100%" }}>
                        <div>
                           {!isPastEvent && (
                              <Button
                                 size="large"
                                 id="register-button"
                                 disabled={isPastEvent}
                                 variant="contained"
                                 children={
                                    user
                                       ? registered
                                          ? "Cancel"
                                          : "I'll attend!"
                                       : "Register to attend"
                                 }
                                 startIcon={
                                    registered ? <ClearIcon /> : <AddIcon />
                                 }
                                 style={{ margin: "5px" }}
                                 onClick={
                                    registered
                                       ? () =>
                                            deregisterFromLivestream(
                                               currentLivestream.id
                                            )
                                       : () =>
                                            startRegistrationProcess(
                                               currentLivestream.id
                                            )
                                 }
                                 color={registered ? "default" : "primary"}
                              />
                           )}
                           <Button
                              size="large"
                              children={"How Live Streams Work"}
                              startIcon={<SettingsIcon />}
                              style={{ margin: "5px" }}
                              onClick={() => goToSeparateRoute("/howitworks")}
                              color="secondary"
                              variant="contained"
                           />
                        </div>
                     </div>
                     <div style={{ textAlign: "center", marginBottom: "20px" }}>
                        <TargetOptions options={targetOptions} />
                     </div>
                     <div style={{ textAlign: "center", marginBottom: "20px" }}>
                        <Grid container justify="center" alignItems="center">
                           {logoElements}
                        </Grid>
                     </div>
                     {!isPastEvent && (
                        <div className="topDescriptionContainer">
                           <div
                              className="countdown-title"
                              style={{
                                 textAlign: "center",
                                 color: registered
                                    ? "white"
                                    : "rgb(255, 20, 147)",
                              }}
                           >
                              This live stream starts here in
                           </div>
                           <div
                              style={{
                                 textAlign: "center",
                                 color: "rgb(255, 20, 147)",
                              }}
                           >
                              <Countdown date={currentLivestream.startDate}>
                                 <span style={{ margin: "30px" }}>
                                    This livestream will start shortly
                                 </span>
                              </Countdown>
                           </div>
                        </div>
                     )}
                  </Container>
                  <div className="bottom-icon">
                     <KeyboardArrowDownIcon
                        style={{ color: "rgb(44, 66, 81)" }}
                        fontSize="large"
                     />
                  </div>
               </div>
            </div>
         </div>
         <div className="white-container">
            <Container>
               <div ref={summaryRef} className="container-title">Short summary</div>
               <div
                  style={{
                     fontSize: "1.3em",
                     lineHeight: "1.4em",
                     width: "80%",
                     margin: "0 auto",
                  }}
               >
                  <LinkifyText>
                     <Typography style={{ whiteSpace: "pre-line" }}>
                        {currentLivestream.summary}
                     </Typography>
                  </LinkifyText>
                  {/*<MulitLineText text={currentLivestream.summary}/>*/}
               </div>
            </Container>
         </div>
         {!isPastEvent && (
            <div className="grey-container">
               <Container>
                  <div className="container-title">
                     Which questions should the speaker answer during the
                     livestream?
                  </div>
                  <div style={{ textAlign: "center" }}>
                     <TextField
                        variant="outlined"
                        fullWidth
                        value={newQuestionTitle}
                        className={classes.input}
                        onChange={(event) =>
                           setNewQuestionTitle(event.target.value)
                        }
                        maxLength="170"
                     />
                     <Button
                        size="large"
                        variant="contained"
                        children="Submit Your Question"
                        style={{ margin: "20px 0 0 0" }}
                        onClick={() => addNewQuestion()}
                        color="primary"
                     />
                  </div>
                  <div
                     className={
                        "container-title " +
                        (questionElements.length === 0 ? "hidden" : "")
                     }
                     style={{ margin: "30px 0 0 0" }}
                  >
                     Upvote questions from your peers
                  </div>
                  <Grid
                     container
                     spacing={3}
                     style={{ margin: "5px 0 30px 0" }}
                  >
                     {questionElements}
                  </Grid>
                  <div
                     className={user ? "" : "hidden"}
                     style={{ textAlign: "center" }}
                     className={questionElements.length === 0 ? "" : "hidden"}
                  >
                     The speaker is eagerly waiting for your input!
                  </div>
               </Container>
            </div>
         )}
         <div
            className={
               "white-container " +
               (currentLivestream.hasNoTalentPool ? "hidden" : "")
            }
            style={{
               backgroundColor: userIsInTalentPool ? "rgb(0, 210, 170)" : "",
            }}
         >
            <Container>
               <div
                  className="container-title"
                  style={{ color: userIsInTalentPool ? "white" : "" }}
               >
                  {userIsInTalentPool
                     ? "You are part of the talent pool"
                     : "Join the Talent Pool and Get Hired"}
               </div>
               <div>
                  <Box>
                     <Paper
                        style={{ maxWidth: 300, margin: "0 auto" }}
                        className={classes.logoWrapper}
                     >
                        <img
                           src={
                              currentLivestream.companyLogoUrl
                                 ? getResizedUrl(
                                      currentLivestream.companyLogoUrl,
                                      "md"
                                   )
                                 : companyLogoPlaceholder
                           }
                           style={{
                              margin: "0 auto",
                              maxHeight: "100px",
                              maxWidth: "280px",
                           }}
                        />
                     </Paper>
                  </Box>
               </div>
               <Grid
                  container
                  justify="center"
                  alignItems="center"
                  style={{ margin: "50px 0 0 0" }}
               >
                  <Grid item xs={12} md={6} style={{ textAlign: "center" }}>
                     <Button
                        size="large"
                        children={
                           userIsInTalentPool
                              ? "Leave Talent Pool"
                              : "Join Talent Pool"
                        }
                        variant="contained"
                        startIcon={
                           userIsInTalentPool ? (
                              <ClearIcon />
                           ) : (
                              <HowToRegRoundedIcon />
                           )
                        }
                        onClick={
                           userIsInTalentPool
                              ? () => leaveTalentPool()
                              : () => joinTalentPool()
                        }
                        color={userIsInTalentPool ? "default" : "primary"}
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <div
                        style={{
                           margin: "20px 0",
                           color: userIsInTalentPool ? "white" : "",
                        }}
                     >
                        We want to make it easy for students and young pros to
                        find the right company for them. To help you let
                        companies know that you're interested in potentially
                        joining - now or in the future -, we've invented the
                        Talent Pool. By joining its talent pool, the company can
                        contact you at any time with a relevant opportunity.
                     </div>
                  </Grid>
               </Grid>
            </Container>
         </div>
         <div
            className={
               "grey-container " +
               (currentLivestream.hasNoTalentPool ? "hidden" : "")
            }
         >
            <div className="container-title">
               Any problem or question ? We want to hear from you
            </div>
            <Container>
               <div style={{ textAlign: "center" }}>
                  <a
                     className="aboutContentContactButton"
                     href="mailto:thomas@careerfairy.io"
                  >
                     <Button
                        size="large"
                        children="Contact CareerFairy"
                        startIcon={<EmailIcon />}
                        variant="contained"
                        style={{ margin: "30px 0 0 0" }}
                     />
                  </a>
               </div>
            </Container>
         </div>
         <Footer />
         <GroupJoinToAttendModal
            open={openJoinModal}
            groupsWithPolicies={groupsWithPolicies}
            groups={careerCenters}
            alreadyJoined={false}
            userData={userData}
            onConfirm={completeRegistrationProcess}
            closeModal={handleCloseJoinModal}
         />
         <BookingModal
            careerCenters={careerCenters}
            livestream={currentLivestream}
            groupId={groupId}
            modalOpen={bookingModalOpen}
            setModalOpen={setBookingModalOpen}
            registration={registration}
            setRegistration={(value) => setRegistration(value)}
            user={user}
         />
         <JoinTalentPoolModal
            livestream={currentLivestream}
            modalOpen={openTalentPoolModal}
            setModalOpen={setOpenTalentPoolModal}
            userData={userData}
         />
         <style jsx>{`
            .hidden {
               display: none;
            }

            .topLevelContainer {
               background-color: rgb(44, 66, 81);
               position: relative;
               width: 100%;
            }

            .topDescriptionContainer {
               width: 100%;
               position: relative;
               margin: 0 0 40px 0;
               padding: 0 30px;
            }

            .top-menu {
               background-color: rgba(250, 250, 250, 1);
               padding: 15px 0;
               height: 80px;
               text-align: center;
               position: relative;
               box-shadow: 0 0 5px grey;
            }

            .top-menu div,
            .top-menu button {
               display: inline-block;
               vertical-align: middle;
            }

            .top-menu #stream-button {
               margin: 0 50px;
            }

            .top-menu.active {
               background-color: rgba(0, 210, 170, 1);
               color: white;
            }

            .top-menu h3 {
               font-weight: 600;
            }

            .video-mask {
               width: 100%;
               background-color: rgb(230, 230, 230);
               background-size: cover;
               text-align: center;
            }

            .mask {
               width: 100%;
               padding: 20px 0 60px 0;
               background-color: rgba(255, 255, 255, 0.9);
            }

            .livestream-label {
               color: rgb(44, 66, 81);
               font-size: 1.3em;
               border: 3px solid rgb(44, 66, 81);
               display: inline-block;
               font-weight: 700;
               text-transform: uppercase;
               padding: 5px 10px;
               vertical-align: middle;
               margin: 20px 0 20px 0;
            }

            .livestream-title {
               font-size: calc(1.5em + 1.5vw);
               color: rgb(44, 66, 81);
               line-height: 1.4em;
               font-weight: 700;
               max-width: 800px;
               margin: 0 auto;
               text-align: center;
            }

            .livestream-speaker-avatar-capsule {
               border: 2px solid rgb(0, 210, 170);
               display: inline-block;
               margin: 20px auto;
               padding: 8px;
               border-radius: 50%;
            }

            .livestream-speaker-avatar {
               width: 110px;
               padding-top: 110px;
               border-radius: 50%;
               vertical-align: middle;
               display: inline-block;
               box-shadow: 0 0 2px grey;
               display: inline-block;
               background-size: cover;
            }

            .livestream-date {
               text-align: center;
               font-size: 1.3em;
               font-weight: 700;
               color: rgb(255, 20, 147);
               vertical-align: middle;
               margin: 20px 0;
               width: 100%;
               text-transform: uppercase;
            }

            .livestream-speaker-image-container {
               display: inline-block;
               border: 2px solid rgb(0, 210, 170);
               border-radius: 50%;
            }

            .livestream-speaker-image {
               min-height: 100px;
               min-width: 100px;
               border-radius: 9999px;
               background-size: cover;
               background-position: center center;
               vertical-align: middle;
               margin: 20px auto;
            }

            .livestream-speaker-description {
               display: inline-block;
               vertical-align: middle;
               width: 100%;
               text-align: center;
               margin: 0 0 0 10px;
            }

            .livestream-speaker-name {
               display: inline-block;
               color: rgb(44, 66, 81);
               vertical-align: middle;
            }

            .livestream-speaker-name div:first-child {
               font-size: 1.4em;
               margin: 0 0 5px 0;
               font-weight: 600;
            }

            .video-mask-title {
               width: 100%;
               text-align: center;
               font-weight: 600;
               color: white;
               z-index: 4000;
               padding: 15px 0;
            }

            .countdown-title {
               text-transform: uppercase;
               font-weight: 700;
               color: rgb(120, 120, 120);
               margin: 40px 0 0 0;
            }

            .live-now {
               margin-bottom: 30px;
               text-transform: uppercase;
               font-size: 1.8em;
               vertical-align: middle;
               color: red;
            }

            .live-now span {
               margin-left: 10px;
            }

            .live-now i,
            .live-now span {
               vertical-align: middle;
            }

            .bottom-icon {
               color: rgb(44, 66, 81);
               position: absolute;
               bottom: 10px;
               width: 100%;
               text-align: center;
               font-size: 1.4em;
            }

            .container-title {
               text-transform: uppercase;
               text-align: center;
               font-size: 1.1em;
               font-weight: 700;
               margin-bottom: 20px;
               color: rgb(150, 150, 150);
            }

            .white-container {
               padding: 40px 0 50px 0;
               text-align: center;
            }

            .grey-container {
               position: relative;
               width: 100%;
               padding: 40px 0 50px 0;
               background-color: rgb(245, 245, 245);
            }

            .description {
               width: 70%;
               margin: 30px auto;
               line-height: 1.4em;
               text-align: center;
            }

            .spots-left {
               position: absolute;
               right: 40px;
               bottom: 40px;
               height: 100px;
               width: 100px;
               border-radius: 50%;
               background-color: white;
               text-align: center;
               padding: 28px 0;
            }

            .spots-left-number {
               font-size: 1.8em;
               font-weight: 700;
               color: rgb(0, 210, 170);
            }

            .spots-left-label {
               font-size: 1em;
               font-weight: 700;
               margin: 5px 0;
               color: rgb(44, 66, 81);
            }
         `}</style>
      </div>
   );
}

export async function getServerSideProps({
   params: { livestreamId, groupId },
}) {
   let serverSideLivestream = {};
   const snap = await store.firestore.get({
      collection: "livestreams",
      doc: livestreamId,
   });
   if (snap.exists) {
      serverSideLivestream = snap.data();
      // Clear out sensitive data for initial props
      delete serverSideLivestream.registeredUsers;
      delete serverSideLivestream.talentPool;
      delete serverSideLivestream.adminEmails;
      delete serverSideLivestream.adminEmail;
      delete serverSideLivestream.author;
      delete serverSideLivestream.status;

      serverSideLivestream.id = snap.id;
      serverSideLivestream.createdDateString =
         serverSideLivestream.created?.toDate?.().toString() || null;
      serverSideLivestream.lastUpdatedDateString =
         serverSideLivestream.lastUpdated?.toDate?.().toString() || null;
      serverSideLivestream.startDateString =
         serverSideLivestream.start?.toDate?.().toString() || null;

      // Clear out props that have methods of which the server can't parse
      delete serverSideLivestream.created;
      delete serverSideLivestream.lastUpdated;
      delete serverSideLivestream.start;
   }
   return {
      props: { serverSideLivestream, groupId: groupId || null }, // will be passed to the page component as props
   };
}

export default withFirebasePage(UpcomingLivestream);
