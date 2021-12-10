import React, { useContext, useEffect, useState } from "react";
import { useFirebase } from "context/firebase";
import {
   Box,
   Button,
   Collapse,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grid,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { RegistrationContext } from "context/registration/RegistrationContext";
import { useAuth } from "../../../../../../HOCs/AuthProvider";
import { useRouter } from "next/router";
import QuestionCard from "./QuestionCard";
import GroupLogo from "../../common/GroupLogo";
import CustomInfiniteScroll from "../../../../../util/CustomInfiteScroll";

const useStyles = makeStyles((theme) => ({
   actions: {
      display: "flex",
      flexFlow: "column",
      alignItems: "center",
   },
   content: {
      padding: theme.spacing(1),
   },
}));
const questionsContainerHeight = 400;
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
   } = useContext(RegistrationContext);
   const classes = useStyles();
   const [show, setShow] = useState(false);

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
      <>
         <GroupLogo logoUrl={group.logoUrl} />
         <DialogTitle align="center">
            WHICH QUESTIONS SHOULD THE SPEAKER ANSWER?
         </DialogTitle>
         <DialogContent className={classes.content}>
            <Collapse in={Boolean(questions.length && !sliding && show)}>
               <Box height={questionsContainerHeight}>
                  <CustomInfiniteScroll
                     height={questionsContainerHeight}
                     hasMore={hasMore}
                     next={getMore}
                     dataLength={questions.length}
                  >
                     <Box p={2}>
                        <Grid container spacing={2}>
                           {questions.map((question, index) => (
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
               </Box>
            </Collapse>
         </DialogContent>
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
      </>
   );
};

export default QuestionUpvote;
