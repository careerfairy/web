import React, { useContext } from "react";
import { useFirebase } from "context/firebase";
import {
   Box,
   Button,
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
import useInfiniteScrollServer from "../../../../../custom-hook/useInfiniteScrollServer";
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

const QuestionUpvote = () => {
   const { handleNext, group, livestream } = useContext(RegistrationContext);
   const classes = useStyles();
   const { upvoteLivestreamQuestion, livestreamQuestionsQuery } = useFirebase();

   const { push } = useRouter();
   const { authenticatedUser } = useAuth();
   const {
      docs,
      hasMore,
      getMore,
      handleClientUpdate,
   } = useInfiniteScrollServer({
      limit: 3,
      query: livestreamQuestionsQuery(livestream?.id),
   });
   console.log("-> hasMore", hasMore);

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

         handleClientUpdate(question.id, {
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
            <Box height={300}>
               <CustomInfiniteScroll
                  height={300}
                  hasMore={hasMore}
                  next={getMore}
                  // style={{ overflow: "inherit" }}
                  dataLength={docs.length}
               >
                  {/*{docs.map((question) => (*/}
                  {/*   <Fade key={question.id} up>*/}
                  {/*      <QuestionCard*/}
                  {/*         question={question}*/}
                  {/*         hasVoted={hasVoted}*/}
                  {/*         handleUpvote={handleUpvote}*/}
                  {/*      />*/}
                  {/*   </Fade>*/}
                  {/*))}*/}
                  <Box p={2}>
                     <Grid container spacing={2}>
                        {docs.map((question, index) => (
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
