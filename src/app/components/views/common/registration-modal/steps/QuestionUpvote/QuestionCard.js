import React, { useState } from "react";
import PropTypes from "prop-types";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import {
   Button,
   Card,
   CardActions,
   CardContent,
   CardHeader,
   CircularProgress,
   Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
   root: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      padding: theme.spacing(1),
   },
   questionTitle: {
      // fontSize: "1.2em",
      // fontWeight: 500,
      wordBreak: "break-word",
   },
   actions: {
      marginTop: "auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   icon: {
      marginLeft: theme.spacing(0.5),
   },
   voteCount: {
      display: "flex",
      alignItems: "center",
      color: theme.palette.action.disabled,
   },
   voteText: {
      fontWeight: 700,
      marginTop: `${theme.spacing(0.5)}px !important`,
   },
   content: {
      padding: theme.spacing(1),
   },
   header: {
      padding: theme.spacing(1),
   },
}));

const QuestionCard = ({ isPastEvent, question, handleUpvote, hasVoted }) => {
   const [loading, setLoading] = useState(false);
   const classes = useStyles();

   return (
      <Card elevation={2} className={classes.root}>
         <CardHeader
            className={classes.header}
            action={
               <div className={classes.voteCount}>
                  <Typography
                     color="inherit"
                     className={classes.voteText}
                     variant="body1"
                  >
                     {question.votes}
                  </Typography>
                  <ThumbUpIcon className={classes.icon} color="inherit" />
               </div>
            }
         />
         <CardContent className={classes.content}>
            <Typography
               align="center"
               className={classes.questionTitle}
               variant="body2"
               component="p"
            >
               {question.title}
            </Typography>
         </CardContent>
         <CardActions className={classes.actions} disableSpacing>
            <Button
               disabled={hasVoted(question) || isPastEvent || loading}
               variant="contained"
               fullWidth
               onClick={async () => {
                  try {
                     setLoading(true);
                     await handleUpvote(question);
                  } catch (e) {}
                  setLoading(false);
               }}
               color="primary"
               startIcon={
                  loading ? (
                     <CircularProgress size={10} color="inherit" />
                  ) : (
                     <ThumbUpIcon />
                  )
               }
            >
               upvote
            </Button>
         </CardActions>
      </Card>
   );
};

QuestionCard.propTypes = {
   handleUpvote: PropTypes.func,
   hasVoted: PropTypes.func,
   isPastEvent: PropTypes.bool,
   question: PropTypes.object.isRequired,
};

export default QuestionCard;
