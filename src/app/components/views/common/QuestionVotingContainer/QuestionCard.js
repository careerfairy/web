import React, { useState } from "react";
import PropTypes from "prop-types";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import {
   Box,
   Button,
   Chip,
   CircularProgress,
   Paper,
   Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getTimeFromNow } from "../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   paperRoot: {
      padding: theme.spacing(1),
      borderRadius: theme.spacing(2),
      display: "flex",
      flexDirection: "column",
   },
   chipTime: {
      color: theme.palette.text.secondary,
   },
   chipLabel: {
      fontSize: "0.8rem",
   },
}));

const QuestionCard = ({
   isPastEvent,
   question,
   handleUpvote,
   hasVoted,
   votingDisabled,
}) => {
   const [loading, setLoading] = useState(false);
   const classes = useStyles();
   return (
      <Paper className={classes.paperRoot} variant="outlined">
         <Box>
            <Chip
               variant="outlined"
               className={classes.chipTime}
               size="small"
               classes={{ label: classes.chipLabel }}
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
                     setLoading(true);
                     await handleUpvote(question);
                  } catch (e) {}
                  setLoading(false);
               }}
               color={hasVoted(question) || isPastEvent ? "default" : "primary"}
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
   );
};

QuestionCard.propTypes = {
   handleUpvote: PropTypes.func,
   hasVoted: PropTypes.func,
   isPastEvent: PropTypes.bool,
   question: PropTypes.object.isRequired,
};

export default QuestionCard;
