import React, { useState } from "react"
import PropTypes from "prop-types"
import ThumbUpIcon from "@mui/icons-material/ThumbUp"
import {
   Box,
   Button,
   Chip,
   CircularProgress,
   Paper,
   Typography,
} from "@mui/material"
import { getTimeFromNow } from "../../../helperFunctions/HelperFunctions"

const styles = {
   paperRoot: {
      padding: (theme) => theme.spacing(1),
      borderRadius: (theme) => theme.spacing(2),
      display: "flex",
      flexDirection: "column",
   },
   chipTime: {
      color: (theme) => theme.palette.text.secondary,
      "& .MuiChip-labelSmall": {
         fontSize: "0.8rem",
      },
   },
}

const QuestionCard = ({
   isPastEvent,
   question,
   handleUpvote,
   hasVoted,
   votingDisabled,
}) => {
   const [loading, setLoading] = useState(false)
   return (
      <Paper sx={styles.paperRoot} variant="outlined">
         <Box>
            <Chip
               variant="outlined"
               sx={styles.chipTime}
               size="small"
               label={getTimeFromNow(question.timestamp)}
            />
         </Box>
         <Box py={1}>
            <Typography variant="body2">{question.title}</Typography>
         </Box>
         <Box>
            <Button
               disabled={
                  hasVoted(question) || isPastEvent || loading || votingDisabled
               }
               variant="text"
               size="small"
               onClick={async () => {
                  try {
                     setLoading(true)
                     await handleUpvote(question)
                  } catch (e) {}
                  setLoading(false)
               }}
               color={hasVoted(question) || isPastEvent ? "grey" : "primary"}
               startIcon={
                  loading ? (
                     <CircularProgress size={10} color="inherit" />
                  ) : (
                     <ThumbUpIcon />
                  )
               }
            >
               {`${question.votes} Likes`}
            </Button>
         </Box>
      </Paper>
   )
}

QuestionCard.propTypes = {
   handleUpvote: PropTypes.func,
   hasVoted: PropTypes.func,
   isPastEvent: PropTypes.bool,
   question: PropTypes.object.isRequired,
}

export default QuestionCard
