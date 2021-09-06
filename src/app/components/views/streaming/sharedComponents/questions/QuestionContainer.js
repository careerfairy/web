import PropTypes from "prop-types";
import React, { memo, useContext, useEffect, useState } from "react";
import ThumbUpRoundedIcon from "@material-ui/icons/ThumbUpRounded";
import Linkify from "react-linkify";
import ExpandLessRoundedIcon from "@material-ui/icons/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@material-ui/icons/ExpandMoreRounded";
import { withFirebase } from "context/firebase";
import {
   Box,
   Button,
   Card,
   CircularProgress,
   ClickAwayListener,
   Collapse,
   Grow,
   Paper,
   Slide,
   TextField,
   Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PlayIconButton } from "materialUI/GlobalButtons/GlobalButtons";
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "materialUI/GlobalTooltips";
import TutorialContext from "context/tutorials/TutorialContext";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import useStreamRef from "../../../../custom-hook/useStreamRef";
import { compose } from "redux";
import { useCurrentStream } from "../../../../../context/stream/StreamContext";

const useStyles = makeStyles((theme) => ({
   chatInput: {
      background: ({ active }) =>
         active ? theme.palette.common.white : theme.palette.background.paper,
      borderRadius: 10,
      "& .MuiInputBase-root": {
         color: ({ active }) =>
            active ? theme.palette.common.black : theme.palette.text.primary,
         paddingRight: "0 !important",
         borderRadius: 10,
      },
   },
   questionContainer: {
      backgroundColor: ({ active }) =>
         active
            ? theme.palette.primary.main
            : theme.palette.type === "light"
            ? theme.palette.background.offWhite
            : theme.palette.background.paper,
      color: ({ active }) => (active ? theme.palette.common.white : "inherit"),
      position: "relative",
      padding: "20px 0 0 0",
      margin: 10,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      borderRadius: theme.spacing(1),
      // width: "100%"
   },
   reactionsQuestion: {
      fontWeight: 700,
      fontSize: "1.3em",
      lineHeight: "1.3em",
      color: ({ active }) => (active ? "white" : theme.palette.text.primary),
      margin: "5px 0",
      width: "85%",
      wordBreak: "break-word",
   },
   reactionsToggle: {
      textTransform: "uppercase",
      cursor: "pointer",
      color: "rgb(210,210,210)",
      display: "flex",
      alignItems: "center",
   },
   showText: {
      color: ({ active }) =>
         active ? "rgb(200,200,200)" : theme.palette.text.secondary,
      fontSize: "0.8em",
      fontWeight: 500,
   },
   upVotes: {
      position: "absolute",
      top: 10,
      right: 10,
      fontSize: "1.2em",
      display: "inline-block",
      margin: "0 0 0 30px",
      fontWeight: 700,
      color: ({ active }) => (active ? "white" : theme.palette.primary.main),
   },
   questionComment: {
      background: ({ active }) =>
         active
            ? theme.palette.common.white
            : theme.palette.type === "dark"
            ? theme.palette.background.default
            : theme.palette.background.paper,
      color: ({ active }) =>
         active ? theme.palette.common.black : theme.palette.text.primary,
   },
   questionButton: {
      borderRadius: "0 0 5px 5px",
      padding: "10px 0",
      color: theme.palette.common.white,
   },
}));

const ReactionsToggle = ({
   handleToggle,
   showAllReactions,
   loading,
   active,
}) => {
   const classes = useStyles({ active });

   return loading ? (
      <CircularProgress />
   ) : (
      <div className={classes.reactionsToggle} onClick={handleToggle}>
         {showAllReactions ? (
            <ExpandLessRoundedIcon
               style={{ marginRight: "3px", fontSize: "1.8em" }}
            />
         ) : (
            <ExpandMoreRoundedIcon
               style={{ marginRight: "3px", fontSize: "1.8em" }}
            />
         )}
         <Typography className={classes.showText}>
            {showAllReactions ? "Hide" : "Show all reactions"}
         </Typography>
      </div>
   );
};

const QuestionContainer = memo(
   ({
      sliding,
      user,
      streamer,
      question,
      firebase,
      index,
      isNextQuestions,
      selectedState,
      goToThisQuestion,
      setOpenQuestionId,
      openQuestionId,
      showMenu,
   }) => {
      const streamRef = useStreamRef();
      const { currentLivestream: livestream, isBreakout } = useCurrentStream();
      const [newCommentTitle, setNewCommentTitle] = useState("");
      const [comments, setComments] = useState([]);
      const [showAllReactions, setShowAllReactions] = useState(false);
      const { authenticatedUser, userData } = useAuth();
      const { tutorialSteps, handleConfirmStep } = useContext(TutorialContext);
      const [loading, setLoading] = useState(false);
      const isEmpty =
         !newCommentTitle.trim() || (!userData && !livestream?.test);
      const active = question?.type === "current";
      const old = question?.type !== "new";
      const upvoted =
         (!user && !livestream?.test) ||
         (question?.emailOfVoters
            ? question?.emailOfVoters.indexOf(
                 livestream?.test ? "streamerEmail" : authenticatedUser.email
              ) > -1
            : false);
      const classes = useStyles({ active });

      useEffect(() => {
         if (livestream.id && question.id && showAllReactions) {
            setLoading(true);
            const unsubscribe = firebase.listenToQuestionComments(
               streamRef,
               question.id,
               (querySnapshot) => {
                  setComments(
                     querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                     }))
                  );
                  setLoading(false);
               }
            );
            return () => unsubscribe();
         }
      }, [livestream.id, question.id, showAllReactions]);

      useEffect(() => {
         if (livestream.id && question.id && !showAllReactions) {
            if (question.firstComment) {
               setComments([question.firstComment]);
            }
         }
      }, [question.firstComment, showAllReactions]);

      useEffect(() => {
         if (active && !showAllReactions) {
            makeGloballyActive();
         }
      }, [active, question.type]);

      async function addNewComment() {
         try {
            if (
               !newCommentTitle.trim() ||
               (!userData && !livestream?.test && !streamer)
            ) {
               return;
            }

            const newComment = streamer
               ? {
                    title: newCommentTitle,
                    author: "Streamer",
                 }
               : {
                    title: newCommentTitle,
                    author: userData
                       ? userData.firstName + " " + userData.lastName.charAt(0)
                       : "anonymous",
                 };

            if (isBreakout) {
               await firebase.putQuestionCommentWithTransaction(
                  streamRef,
                  question.id,
                  newComment
               );
            } else {
               await firebase.putQuestionComment(
                  streamRef,
                  question.id,
                  newComment
               );
            }

            setNewCommentTitle("");
            makeGloballyActive();
         } catch (error) {
            console.log("Error: " + error);
         }
      }

      function addNewCommentOnEnter(target) {
         if (target.charCode == 13) {
            addNewComment();
            isOpen(2) && handleConfirmStep(2);
         }
      }

      function upvoteLivestreamQuestion() {
         let authEmail = livestream.test
            ? "streamerEmail"
            : authenticatedUser.email;
         firebase.upvoteLivestreamQuestionWithRef(
            streamRef,
            question,
            authEmail
         );
      }

      const isOpen = (property) => {
         return Boolean(
            livestream.test &&
               showMenu &&
               tutorialSteps.streamerReady &&
               index === 0 &&
               tutorialSteps[property] &&
               isNextQuestions &&
               selectedState === "questions" &&
               !sliding
         );
      };

      const componentDecorator = (href, text, key) => (
         <a href={href} key={key} target="_blank">
            {text}
         </a>
      );

      const makeGloballyActive = () => {
         setOpenQuestionId(question.id);
         setShowAllReactions(true);
      };
      const clearGloballyActive = () => {
         setOpenQuestionId("");
         setShowAllReactions(false);
      };

      const handleToggle = () => {
         if (showAllReactions) {
            clearGloballyActive();
         } else {
            makeGloballyActive();
         }
      };

      let commentsElements = comments.map((comment) => {
         return (
            <Slide key={comment.id} in direction="right">
               <Box
                  key={comment.id}
                  className={classes.questionComment}
                  borderRadius={8}
                  mb={1}
                  p={1}
                  component={Card}
               >
                  <div style={{ wordBreak: "break-word" }}>
                     <Linkify componentDecorator={componentDecorator}>
                        <span>{comment.title}</span>
                     </Linkify>
                  </div>
                  <div style={{ fontSize: "0.8em", color: "rgb(160,160,160)" }}>
                     <span>@{comment.author}</span>
                  </div>
               </Box>
            </Slide>
         );
      });

      return (
         <Grow in>
            <WhiteTooltip
               placement="right-start"
               title={
                  <React.Fragment>
                     <TooltipTitle>Student Questions (1/3)</TooltipTitle>
                     <TooltipText>
                        These are the questions that students already asked and
                        upvoted before your event
                     </TooltipText>
                     <TooltipButtonComponent
                        onConfirm={() => handleConfirmStep(0)}
                        buttonText="Ok"
                     />
                  </React.Fragment>
               }
               open={isOpen(0)}
            >
               <Paper elevation={4} className={classes.questionContainer}>
                  <div style={{ padding: "20px 20px 5px 20px" }}>
                     <div className={classes.upVotes}>
                        <span>{question.votes}</span>
                        <ThumbUpRoundedIcon
                           color="inherit"
                           style={{ verticalAlign: "text-top" }}
                           fontSize="small"
                        />
                     </div>
                     <div className={classes.reactionsQuestion}>
                        <span>{question.title}</span>
                     </div>
                     <Typography
                        style={{
                           fontSize: "1em",
                           verticalAlign: "middle",
                           fontWeight: 700,
                           color: active ? "white" : "rgb(200,200,200)",
                           marginBottom: "1rem",
                        }}
                     >
                        {question.numberOfComments || 0} reaction
                        {question.numberOfComments !== 1 && <span>s</span>}
                     </Typography>
                     {commentsElements[0]}
                     <Collapse
                        style={{ width: "100%" }}
                        in={
                           showAllReactions &&
                           !loading &&
                           question.id === openQuestionId
                        }
                     >
                        {commentsElements.slice(1)}
                     </Collapse>
                     {question.numberOfComments > 1 && (
                        <ReactionsToggle
                           handleToggle={handleToggle}
                           active={active}
                           showAllReactions={showAllReactions}
                           loading={loading}
                        />
                     )}
                  </div>
                  <WhiteTooltip
                     placement="right-start"
                     title={
                        <React.Fragment>
                           <TooltipTitle>Student Questions (3/3)</TooltipTitle>
                           <TooltipText>
                              In the recruiter-chat a company HR representative
                              can answer recruiting related questions. Try and
                              type a comment.
                           </TooltipText>
                           <TooltipButtonComponent
                              onConfirm={() => handleConfirmStep(2)}
                              buttonText="Ok"
                           />
                        </React.Fragment>
                     }
                     open={isOpen(2)}
                  >
                     <Box p={1}>
                        <TextField
                           value={newCommentTitle}
                           className={classes.chatInput}
                           onKeyPress={addNewCommentOnEnter}
                           placeholder="Send a reaction..."
                           fullWidth
                           size="small"
                           variant="outlined"
                           InputProps={{
                              maxLength: 340,
                              endAdornment: (
                                 <PlayIconButton
                                    isEmpty={isEmpty}
                                    addNewComment={() => {
                                       addNewComment();
                                       isOpen(2) && handleConfirmStep(2);
                                    }}
                                 />
                              ),
                           }}
                           onChange={(event) => {
                              setNewCommentTitle(event.currentTarget.value);
                           }}
                        />
                     </Box>
                  </WhiteTooltip>
                  {streamer ? (
                     <WhiteTooltip
                        placement="right-start"
                        title={
                           <React.Fragment>
                              <TooltipTitle>
                                 Student Questions (2/3)
                              </TooltipTitle>
                              <TooltipText>
                                 Before answering a question verbally, make sure
                                 to highlight the question with Answer Now
                              </TooltipText>
                              <TooltipButtonComponent
                                 onConfirm={() => {
                                    goToThisQuestion(question.id);
                                    handleConfirmStep(1);
                                 }}
                                 buttonText="Ok"
                              />
                           </React.Fragment>
                        }
                        open={isOpen(1)}
                     >
                        <Button
                           startIcon={<ThumbUpRoundedIcon />}
                           size="small"
                           disableElevation
                           disabled={old}
                           className={classes.questionButton}
                           fullWidth
                           color="primary"
                           onClick={() => {
                              goToThisQuestion(question.id);
                              isOpen(1) && handleConfirmStep(1);
                           }}
                           variant="contained"
                        >
                           {active ? (
                              <span>Answering</span>
                           ) : old ? (
                              <span>Answered</span>
                           ) : (
                              <span>Answer Now</span>
                           )}
                        </Button>
                     </WhiteTooltip>
                  ) : (
                     <Button
                        startIcon={<ThumbUpRoundedIcon />}
                        size="small"
                        disableElevation
                        className={classes.questionButton}
                        color="primary"
                        fullWidth
                        variant="contained"
                        onClick={() => upvoteLivestreamQuestion()}
                        disabled={old || upvoted}
                     >
                        {!livestream.test &&
                        question.emailOfVoters &&
                        user &&
                        question.emailOfVoters.indexOf(user.email) > -1 ? (
                           <span>UPVOTED!</span>
                        ) : (
                           <span>UPVOTE</span>
                        )}
                     </Button>
                  )}
               </Paper>
            </WhiteTooltip>
         </Grow>
      );
   }
);

QuestionContainer.propTypes = {
   goToThisQuestion: PropTypes.func.isRequired,
   index: PropTypes.number.isRequired,
   isNextQuestions: PropTypes.bool.isRequired,
   question: PropTypes.object.isRequired,
   selectedState: PropTypes.any,
   showMenu: PropTypes.bool,
   sliding: PropTypes.bool,
   streamer: PropTypes.bool,
   user: PropTypes.object,
   setOpenQuestionId: PropTypes.func.isRequired,
   openQuestionId: PropTypes.string,
};

export default compose(withFirebase)(QuestionContainer);
