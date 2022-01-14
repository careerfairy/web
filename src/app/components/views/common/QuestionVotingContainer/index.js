import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { Box, CircularProgress, Divider, Grid } from "@material-ui/core";
import QuestionCard from "./QuestionCard";
import CustomInfiniteScroll from "../../../util/CustomInfiteScroll";

const useStyles = makeStyles((theme) => ({
   root: {},
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
      height: ({ containerHeight }) => containerHeight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& > *": {
         width: "100%",
      },
      // [theme.breakpoints.down("xs")]: {
      //    height: mobileQuestionsContainerHeight,
      // },
   },
}));
const QuestionVotingContainer = ({
   questions,
   questionSortType,
   handleChangeQuestionSortType,
   headerButton,
   loadingInitialQuestions,
   containerHeight,
   hasMore,
   getMore,
   hasVoted,
   handleUpvote,
   votingDisabled,
}) => {
   const classes = useStyles({ containerHeight });
   return (
      <>
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
                  <ToggleButton value="timestamp" aria-label="sort by new">
                     New
                  </ToggleButton>
                  <ToggleButton value="votes" aria-label="sort by popular">
                     Popular
                  </ToggleButton>
               </ToggleButtonGroup>
            )}
            {headerButton}
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
                                 votingDisabled={votingDisabled}
                                 handleUpvote={handleUpvote}
                              />
                           </Grid>
                        ))}
                     </Grid>
                  </Box>
               </CustomInfiniteScroll>
            )}
         </div>
      </>
   );
};

export default QuestionVotingContainer;
