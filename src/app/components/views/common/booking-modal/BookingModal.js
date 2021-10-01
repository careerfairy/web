import { Fragment, useState, useEffect } from "react";

import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CommonUtil from "util/CommonUtil";
import QuestionVotingBox from "components/views/question-voting-box/QuestionVotingBox";

import Link from "next/link";

import { useFirebase, withFirebase } from "context/firebase";
import {
   Box,
   Button,
   Dialog,
   DialogContent,
   Grid,
   TextField,
} from "@material-ui/core";
import CopyLinkField from "../CopyLinkField";
import { getBaseUrl } from "../../../helperFunctions/HelperFunctions";
import { useRouter } from "next/router";
import { useAuth } from "../../../../HOCs/AuthProvider";

function BookingModal({
   modalOpen,
   user,
   careerCenters,
   livestream,
   registration,
   setModalOpen,
   setRegistration,
   buttonAction,
}) {
   const firebase = useFirebase();
   const [modalStep, setModalStep] = useState(0);
   const {
      query: { groupId },
   } = useRouter();
   console.log("-> groupId", groupId);
   const { userData } = useAuth();

   const [upcomingQuestions, setUpcomingQuestions] = useState([]);
   const [questionsAvailable, setQuestionsAvailable] = useState(false);
   const [questionsVoted, setQuestionsVoted] = useState(false);
   const [questionAsked, setQuestionAsked] = useState(false);

   const [newQuestionTitle, setNewQuestionTitle] = useState("");

   const avatar = livestream.mainSpeakerAvatar
      ? livestream.mainSpeakerAvatar
      : "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fplaceholder.png?alt=media";

   useEffect(() => {
      setModalStep(0);
   }, [modalOpen]);

   useEffect(() => {
      if (livestream.id) {
         const unsubscribe = firebase.listenToLivestreamQuestions(
            livestream.id,
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
   }, [livestream]);

   useEffect(() => {
      if (upcomingQuestions.length > 3) {
         setQuestionsAvailable(true);
      }
      let upvotedQuestions = upcomingQuestions.filter((question) => {
         if (!question.emailOfVoters || !user) {
            return false;
         }
         return question.emailOfVoters.indexOf(user.email) > -1;
      });
      if (upvotedQuestions.length > 1) {
         setQuestionsVoted(true);
      }
      let authoredQuestions = upcomingQuestions.filter((question) => {
         if (!user) {
            return false;
         }
         return question.author === user.email;
      });
      if (authoredQuestions.length > 0) {
         setQuestionAsked(true);
      }
   }, [upcomingQuestions]);

   function handleUrl() {
      let url = "/next-livestreams";
      if (groupId) {
         url = `/next-livestreams/${groupId}?livestreamId=${livestream.id}`;
      } else if (
         careerCenters &&
         careerCenters.length &&
         careerCenters.length === 1
      ) {
         // If there's only one group, please send me to that groups page
         url = `/next-livestreams/${careerCenters[0].id}?livestreamId=${livestream.id}`;
      }
      return url;
   }

   const getRefererUrl = () => {
      let url = `/next-livestreams?livestreamId=${livestream.id}`;
      if (userData?.authId) {
         url = `/next-livestreams?livestreamId=${livestream.id}&referrerId=${userData.authId}`;
         if (groupId) {
            url = `/next-livestreams/${groupId}?livestreamId=${livestream.id}&referrerId=${userData.authId}`;
         } else if (careerCenters?.[0]?.id) {
            // If there's only one group, please send me to that groups page
            url = `/next-livestreams/${careerCenters[0].id}?livestreamId=${livestream.id}&referrerId=${userData.authId}`;
         }
      }
      return `${getBaseUrl()}${url}`;
   };

   function addNewQuestion() {
      if (!user) {
         return router.replace("/signup");
      }

      if (!newQuestionTitle) {
         return;
      }

      const newQuestion = {
         title: newQuestionTitle,
         votes: 0,
         type: "new",
         author: user.email,
      };

      firebase.putLivestreamQuestion(livestream.id, newQuestion).then(
         () => {
            setNewQuestionTitle("");
            if (livestream.hasNoTalentPool) {
               setModalStep(4);
            } else {
               setModalStep(3);
            }
         },
         () => {
            console.log("Error");
         }
      );
   }

   const handleFirstStep = () => {
      if (livestream.isFaceToFace) {
         setModalStep(4);
      } else {
         if (questionElements.length > 0) {
            setModalStep(1);
         } else {
            setModalStep(2);
         }
      }
   };

   function joinTalentPool() {
      firebase
         .joinCompanyTalentPool(livestream.companyId, user.email, livestream.id)
         .then(() => {
            setModalStep(4);
         });
   }

   let questionElements = CommonUtil.getRandom(upcomingQuestions, 9).map(
      (question, index) => {
         return (
            <Grid item key={index} xs={12} sm={4}>
               <QuestionVotingBox
                  question={question}
                  user={user}
                  livestream={livestream}
                  isPastEvent={false}
               />
            </Grid>
         );
      }
   );

   return (
      <Fragment>
         <Dialog
            style={{ zIndex: "9999" }}
            open={modalOpen}
            fullWidth={true}
            maxWidth={"md"}
         >
            <DialogContent>
               {/*<Box>*/}
               {/*   <CopyLinkField linkUrl={getRefererUrl()} />*/}
               {/*</Box>*/}
               <div
                  style={{ padding: "200px" }}
                  className={registration ? "" : "hidden"}
               >
                  <img
                     src="/loader.gif"
                     style={{
                        width: "80px",
                        height: "auto",
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                     }}
                  />
               </div>
               <div
                  className={registration ? "hidden" : ""}
                  style={{ textAlign: "center" }}
               >
                  <img
                     src={livestream.companyLogoUrl}
                     style={{
                        maxHeight: "120px",
                        maxWidth: "200px",
                        margin: "20px auto",
                     }}
                  />
                  <div
                     className={
                        modalStep !== 0 ? "hidden" : "modalStep animated fadeIn"
                     }
                  >
                     <h2 className="booking-modal-title">
                        <CheckCircleIcon style={{ marginRight: 10 }} />
                        Your spot is secured!
                     </h2>
                     <Button
                        style={{ margin: "10px 2px" }}
                        color="primary"
                        variant="contained"
                        onClick={handleFirstStep}
                        size="large"
                     >
                        Next
                     </Button>
                  </div>
                  <div className={modalStep !== 1 ? "hidden" : "modalStep"}>
                     <h4 className="booking-modal-subtitle">
                        Which Questions Should The Speaker Answer?
                     </h4>
                     <div style={{ margin: "0 0 50px 0" }}>
                        <Grid container spacing={2}>
                           {questionElements}
                        </Grid>
                     </div>
                     <Button
                        style={{ margin: "10px 2px" }}
                        color="primary"
                        variant="contained"
                        onClick={() => setModalStep(2)}
                        size="large"
                     >
                        Next
                     </Button>
                  </div>
                  <div
                     className={
                        modalStep !== 2 ? "hidden" : "modalStep animated fadeIn"
                     }
                  >
                     <h4 className="booking-modal-subtitle">
                        Ask your question. Get the answer during the live
                        stream.
                     </h4>
                     <div className="livestream-streamer-description">
                        <div className="livestream-speaker-avatar-capsule">
                           <div
                              className="livestream-speaker-avatar"
                              style={{ backgroundImage: "url(" + avatar + ")" }}
                           />
                        </div>
                        <div className="livestream-streamer">
                           <div className="livestream-streamer-name">
                              {livestream.mainSpeakerName}
                           </div>
                           <div className="livestream-streamer-position">
                              {livestream.mainSpeakerPosition}
                           </div>
                           <div className="livestream-streamer-position">
                              {livestream.mainSpeakerBackground}
                           </div>
                        </div>
                     </div>
                     <TextField
                        variant="outlined"
                        value={newQuestionTitle}
                        placeholder={"What would like to ask our speaker?"}
                        maxLength="170"
                        onChange={(event) =>
                           setNewQuestionTitle(event.target.value)
                        }
                        fullWidth
                     />
                     <Button
                        style={{ margin: "20px 0 0 0" }}
                        color="primary"
                        variant="contained"
                        onClick={() => addNewQuestion()}
                        size="large"
                     >
                        Submit
                     </Button>
                     <div
                        style={{
                           margin: "20px 0 10px 0",
                           textAlign: "center",
                           color: "rgb(70,70,200)",
                           cursor: "pointer",
                        }}
                        onClick={
                           livestream.hasNoTalentPool
                              ? () => setModalStep(4)
                              : () => setModalStep(3)
                        }
                     >
                        Skip
                     </div>
                  </div>
                  <div className={modalStep !== 3 ? "hidden" : "modalStep"}>
                     <h4 className="booking-modal-subtitle">
                        Join the {livestream.company} Talent Pool
                     </h4>
                     <div style={{ margin: "0 0 40px 0" }}>
                        Join {livestream.company}'s Talent Pool and be contacted
                        directly in case any relevant opportunity arises for you
                        at {livestream.company} in the future. By joining the
                        Talent Pool, you agree that your profile data will be
                        shared with {livestream.company}. Don't worry, you can
                        leave a Talent Pool at any time.
                     </div>
                     <Button
                        style={{ margin: "20px 0 0 0" }}
                        color="primary"
                        variant="contained"
                        onClick={() => joinTalentPool()}
                        size="large"
                     >
                        Join Talent Pool
                     </Button>
                     <div
                        style={{
                           margin: "20px 0 10px 0",
                           textAlign: "center",
                           color: "rgb(70,70,200)",
                           cursor: "pointer",
                        }}
                        onClick={() => setModalStep(4)}
                     >
                        Skip
                     </div>
                  </div>
                  <div
                     className={
                        modalStep !== 4 ? "hidden" : "modalStep animated fadeIn"
                     }
                  >
                     <h2 className="booking-modal-title">
                        <CheckCircleIcon style={{ marginRight: 10 }} />
                        Thank you!
                     </h2>
                     {careerCenters ? ( // This boolean checks whether or not you're in the details page
                        <Link href={handleUrl()}>
                           <a>
                              <Button
                                 style={{ margin: "20px 0 0 0" }}
                                 color="primary"
                                 fluid
                                 variant="contained"
                                 size="large"
                                 onClick={() => setModalOpen(false)}
                              >
                                 See all our events
                              </Button>
                           </a>
                        </Link>
                     ) : (
                        <Button
                           style={{ margin: "20px 0 0 0" }}
                           color="primary"
                           onClick={() => setModalOpen(false)}
                           size="large"
                        >
                           Finish
                        </Button>
                     )}
                  </div>
               </div>
            </DialogContent>
         </Dialog>
         <style jsx>{`
            .hidden {
               display: none;
            }

            .booking-modal-title {
               color: rgb(0, 210, 170);
               margin: 30px 0 60px 0;
               text-align: center;
               font-size: 1.5em;
            }

            .booking-modal-subtitle {
               color: rgb(100, 100, 100);
               text-align: center;
               text-transform: uppercase;
               font-size: 1.2em;
               margin: 30px 0 10px 0;
            }

            .livestream-speaker-avatar-capsule {
               border: 2px solid rgb(0, 210, 170);
               display: inline-block;
               margin: 0 15px 0 0;
               padding: 6px;
               border-radius: 50%;
            }

            .livestream-speaker-avatar {
               width: 75px;
               padding-top: 75px;
               border-radius: 50%;
               vertical-align: middle;
               display: inline-block;
               box-shadow: 0 0 2px grey;
               display: inline-block;
               background-size: cover;
            }

            .livestream-streamer-position {
               margin: 0 0 0 0;
               font-size: 0.9em;
               line-height: 1.2em;
               color: grey;
               text-align: left;
            }

            .livestream-streamer-degree {
               font-size: 0.8em;
               text-align: left;
            }

            .livestream-streamer-name {
               font-size: 1.3em;
               font-weight: 600;
               margin-bottom: 5px;
               text-align: left;
            }

            .livestream-streamer-description {
               margin: 20px auto;
               text-align: center;
            }

            .livestream-streamer {
               margin-left: 5px;
               display: inline-block;
               vertical-align: middle;
               color: rgb(40, 40, 40);
            }

            .modalStep {
               padding: 10px 0;
            }

            .talentPoolMessage {
               vertical-align: middle;
               margin: 0 10px;
               font-weight: 600;
               text-transform: uppercase;
            }

            .talentPoolMessage.active {
               color: rgb(0, 210, 170);
            }
         `}</style>
      </Fragment>
   );
}

export default BookingModal;
