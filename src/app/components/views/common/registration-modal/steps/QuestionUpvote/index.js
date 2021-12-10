import React, { useContext, useEffect, useState } from "react";
import { useFirebase } from "context/firebase";
import {
   Box,
   Button,
   CircularProgress,
   Collapse,
   DialogActions,
   DialogContent,
   DialogTitle,
   Divider,
   Grid,
   Hidden,
   useMediaQuery,
} from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { RegistrationContext } from "context/registration/RegistrationContext";
import { useAuth } from "../../../../../../HOCs/AuthProvider";
import { useRouter } from "next/router";
import QuestionCard from "./QuestionCard";
import GroupLogo from "../../common/GroupLogo";
import CustomInfiniteScroll from "../../../../../util/CustomInfiteScroll";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
const questionsContainerHeight = 400;
const mobileQuestionsContainerHeight = 300;
const useStyles = makeStyles((theme) => ({
   root: {},
   actions: {
      display: "flex",
      flexFlow: "column",
      alignItems: "center",
   },
   content: {
      padding: theme.spacing(1),
   },
   filterWrapper: {
      padding: theme.spacing(1, 2),
      display: "flex",
      justifyContent: "space-between",
   },
   toggleGroup: {
      "& btn": {
         borderRadius: theme.spacing(2),
      },
   },
   dividerWrapper: {
      padding: theme.spacing(0, 2),
   },
   questionsWrapper: {
      height: questionsContainerHeight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& > *": {
         width: "100%",
      },
      [theme.breakpoints.down("xs")]: {
         height: mobileQuestionsContainerHeight,
      },
   },
}));

const QuestionUpvote = () => {
   const {
      handleNext,
      group,
      livestream,
      hasMore,
      getMore,
      questions,
      handleClientSideQuestionUpdate,
      sliding,
      handleChangeQuestionSortType,
      questionSortType,
      loadingInitialQuestions,
   } = useContext(RegistrationContext);
   const classes = useStyles();
   const [show, setShow] = useState(false);
   const theme = useTheme();
   const mobile = useMediaQuery(theme.breakpoints.down("xs"));
   const containerHeight = mobile
      ? mobileQuestionsContainerHeight
      : questionsContainerHeight;

   useEffect(() => {
      const timeout = setTimeout(() => {
         setShow(true);
      }, 300);

      return () => clearTimeout(timeout);
   }, [show]);
   const { upvoteLivestreamQuestion } = useFirebase();

   const { push } = useRouter();
   const { authenticatedUser } = useAuth();

   useEffect(() => {
      if (!questions.length && !hasMore) {
         handleNext();
      }
   }, [questions, hasMore]);

   const handleUpvote = async (question) => {
      if (!authenticatedUser) {
         return push("/signup");
      }
      try {
         await upvoteLivestreamQuestion(
            livestream.id,
            question,
            authenticatedUser.email
         );

         handleClientSideQuestionUpdate(question.id, {
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

   if (!livestream) return null;

   return (
      <div className={classes.root}>
         <Box width="100%" display="flex" justifyContent="center">
            <Hidden xsDown>
               <GroupLogo logoUrl={group.logoUrl} />
            </Hidden>
         </Box>
         <DialogTitle align="center">
            WHICH QUESTIONS SHOULD THE SPEAKER ANSWER?
         </DialogTitle>
         <DialogContent className={classes.content}>
            <Collapse in={Boolean(questions.length && !sliding && show)}>
               <div className={classes.filterWrapper}>
                  {questions.length > 1 && (
                     <ToggleButtonGroup
                        value={questionSortType}
                        exclusive
                        size="small"
                        className={classes.toggleGroup}
                        onChange={handleChangeQuestionSortType}
                        aria-label="text alignment"
                     >
                        <ToggleButton
                           value="timestamp"
                           aria-label="sort by new"
                        >
                           New
                        </ToggleButton>
                        <ToggleButton
                           value="votes"
                           aria-label="sort by popular"
                        >
                           Popular
                        </ToggleButton>
                     </ToggleButtonGroup>
                  )}
                  <Hidden mdUp>
                     <Button
                        variant="contained"
                        onClick={handleNext}
                        color="primary"
                     >
                        Next
                     </Button>
                  </Hidden>
               </div>
               <div className={classes.dividerWrapper}>
                  <Divider />
               </div>
               <div className={classes.questionsWrapper}>
                  {loadingInitialQuestions ? (
                     <CircularProgress />
                  ) : (
                     <CustomInfiniteScroll
                        height={containerHeight}
                        style={{ width: "100%" }}
                        hasMore={hasMore}
                        next={getMore}
                        dataLength={questions.length}
                     >
                        <Box p={2}>
                           <Grid container spacing={2}>
                              {questions.map((question) => (
                                 <Grid item key={question.id} xs={12} sm={6}>
                                    <QuestionCard
                                       question={question}
                                       hasVoted={hasVoted}
                                       handleUpvote={handleUpvote}
                                    />
                                 </Grid>
                              ))}
                           </Grid>
                        </Box>
                     </CustomInfiniteScroll>
                  )}
               </div>
            </Collapse>
            <Hidden smDown>
               <DialogActions>
                  <Button
                     variant="contained"
                     size="large"
                     onClick={handleNext}
                     color="primary"
                     autoFocus
                  >
                     Next
                  </Button>
               </DialogActions>
            </Hidden>
         </DialogContent>
      </div>
   );
};

export default QuestionUpvote;
