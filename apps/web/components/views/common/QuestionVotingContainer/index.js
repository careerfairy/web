import React from "react"
import {
   Box,
   CircularProgress,
   Divider,
   Grid,
   ToggleButton,
   ToggleButtonGroup,
} from "@mui/material"
import QuestionCard from "./QuestionCard"
import CustomInfiniteScroll from "../../../util/CustomInfiteScroll"

const styles = {
   filterWrapper: {
      padding: (theme) => theme.spacing(1, 2),
      display: "flex",
      justifyContent: "space-between",
   },
   toggleGroup: {
      "& btn": {
         borderRadius: (theme) => theme.spacing(2),
      },
   },

   dividerWrapper: {
      padding: (theme) => theme.spacing(0, 2),
   },
   questionsWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& > *": {
         width: "100%",
      },
   },
}
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
   return (
      <>
         <Box sx={styles.filterWrapper}>
            {questions.length > 1 && (
               <ToggleButtonGroup
                  value={questionSortType}
                  exclusive
                  size="small"
                  sx={styles.toggleGroup}
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
         </Box>
         <Box sx={styles.dividerWrapper}>
            <Divider />
         </Box>
         <Box sx={{ ...styles.questionsWrapper, height: containerHeight }}>
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
         </Box>
      </>
   )
}

export default QuestionVotingContainer
