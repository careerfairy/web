import React, { useContext, useEffect, useState } from "react";
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
import { getRandom } from "../../../../../../util/CommonUtil";
import QuestionCard from "./QuestionCard";
import GroupLogo from "../../common/GroupLogo";
import MuiGridFade from "../../../../../../materialUI/animations/MuiGridFade";
import useInfiniteScrollServer from "../../../../../custom-hook/useInfiniteScrollServer";
import CustomInfiniteScroll from "../../../../../util/CustomInfiteScroll";
import Fade from "react-reveal/Fade";

const useStyles = makeStyles((theme) => ({
   actions: {
      display: "flex",
      flexFlow: "column",
      alignItems: "center",
   },
}));

const QuestionUpvote = () => {
   const { handleNext, group, livestream } = useContext(RegistrationContext);
   const classes = useStyles();
   const { upvoteLivestreamQuestion, livestreamQuestionsQuery } = useFirebase();

   const { push } = useRouter();
   const { authenticatedUser } = useAuth();
   const { docs, hasMore, getMore } = useInfiniteScrollServer({
      limit: 3,
      query: livestreamQuestionsQuery(livestream?.id),
   });
   console.log("-> hasMore", hasMore);

   const handleUpvote = (question) => {
      if (!authenticatedUser) {
         return push("/signup");
      }
      upvoteLivestreamQuestion(
         livestream.id,
         question,
         authenticatedUser.email
      );
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
         <DialogContent>
            <Box height={300}>
               <CustomInfiniteScroll
                  height={300}
                  hasMore={hasMore}
                  next={getMore}
                  dataLength={docs.length}
               >
                  {docs.map((question) => (
                     <Fade key={question.id} up>
                        <QuestionCard
                           question={question}
                           hasVoted={hasVoted}
                           handleUpvote={handleUpvote}
                        />
                     </Fade>
                  ))}
               </CustomInfiniteScroll>
            </Box>
            {/*<Grid container spacing={2}>*/}
            {/*   */}
            {/*   {docs.map((question, index) => (*/}
            {/*      <Grid item key={question.id} xs={12} sm={4}>*/}
            {/*         <MuiGridFade index={index} up>*/}
            {/*            <QuestionCard*/}
            {/*               question={question}*/}
            {/*               hasVoted={hasVoted}*/}
            {/*               handleUpvote={handleUpvote}*/}
            {/*            />*/}
            {/*         </MuiGridFade>*/}
            {/*      </Grid>*/}
            {/*   ))}*/}
            {/*</Grid>*/}
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
