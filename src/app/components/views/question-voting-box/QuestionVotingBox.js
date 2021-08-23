import PropTypes from "prop-types";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import { useRouter } from "next/router";
import { withFirebasePage } from "context/firebase";
import {
   Button,
   Card,
   CardActions,
   CardContent,
   CardHeader,
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
      fontSize: "1.2em",
      fontWeight: 500,
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
}));

function QuestionVotingBox(props) {
    const classes = useStyles()
    const router = useRouter();

    function upvoteLivestreamQuestion(user, question) {

        if (!user) {
            return router.push('/signup');
        }

        props.firebase.upvoteLivestreamQuestion(props.livestream.id, question, user.email);
    }

    function userHasVotedOnQuestion(user, question) {
        if (!user || !question.emailOfVoters) {
            return false;
        }
        return question.emailOfVoters.indexOf(user.email) > -1;
    }

    return (
        <Card elevation={2} className={classes.root}>
            <CardHeader
                action={
                    <div className={classes.voteCount}>
                        <Typography color="inherit" className={classes.voteText} variant="body1">
                            {props.question.votes}
                        </Typography>
                        <ThumbUpIcon className={classes.icon} color="inherit"/>
                    </div>
                }
            />
            <CardContent>
                <Typography align="center" className={classes.questionTitle} variant="body2" component="p">
                    {props.question.title}
                </Typography>
            </CardContent>
            <CardActions className={classes.actions} disableSpacing>
                <Button disabled={userHasVotedOnQuestion(props.user, props.question) || props.isPastEven}
                        variant="contained" fullWidth 
                        onClick={() => upvoteLivestreamQuestion(props.user, props.question)}
                        color="primary" startIcon={<ThumbUpIcon/>}>
                    upvote
                </Button>
            </CardActions>
        </Card>
    )
}

QuestionVotingBox.propTypes =
    {
        firebase: PropTypes.object,
        livestream: PropTypes.object,
        isPastEvent: PropTypes.bool,
        question: PropTypes.shape({
            title: PropTypes.string,
            votes: PropTypes.number
        }),
        user: PropTypes.object
    }

export default withFirebasePage(QuestionVotingBox);

