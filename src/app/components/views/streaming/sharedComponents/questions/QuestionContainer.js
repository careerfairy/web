import React, {useState, useEffect, useContext} from 'react';
import Grow from '@material-ui/core/Grow';
import ThumbUpRoundedIcon from '@material-ui/icons/ThumbUpRounded';
import Linkify from 'react-linkify';
import ExpandLessRoundedIcon from '@material-ui/icons/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import {withFirebase} from 'context/firebase';
import {Box, Button, Slide, TextField} from "@material-ui/core";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Collapse from "@material-ui/core/Collapse";
import Card from "@material-ui/core/Card";
import {PlayIconButton} from "materialUI/GlobalButtons/GlobalButtons";
import Paper from "@material-ui/core/Paper";
import {
    TooltipButtonComponent,
    TooltipText,
    TooltipTitle,
    WhiteTooltip
} from "materialUI/GlobalTooltips";
import TutorialContext from "context/tutorials/TutorialContext";
import {useAuth} from "../../../../../HOCs/AuthProvider";

const useStyles = makeStyles(theme => ({
    chatInput: {
        background: theme.palette.background.paper,
        borderRadius: 10,
        "& .MuiInputBase-root": {
            paddingRight: "0 !important",
            borderRadius: 10,
        },
    },
    questionContainer: {
        backgroundColor: ({active}) => active ? theme.palette.primary.main: theme.palette.type === "light" ? theme.palette.background.offWhite: theme.palette.background.paper,
        color: ({active}) => active ? "white" : "inherit",
        position: "relative",
        padding: "20px 0 0 0",
        margin: 10,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: theme.spacing(1),
        // width: "100%"
    },
    reactionsQuestion: {
        fontWeight: 700,
        fontSize: "1.3em",
        lineHeight: "1.3em",
        color: ({active}) => active ? "white" : theme.palette.text.primary,
        margin: "5px 0",
        width: "85%",
        wordBreak: "break-word",
    },
    reactionsToggle: {
        textTransform: "uppercase",
        cursor: "pointer",
        color: "rgb(210,210,210)",
        display: "flex",
        alignItems: "center"
    },
    showText: {
        color: theme.palette.text.secondary,
        fontSize: "0.8em",
        fontWeight: 500
    },
    upVotes: {
        position: "absolute",
        top: 10,
        right: 10,
        fontSize: "1.2em",
        display: "inline-block",
        margin: "0 0 0 30px",
        fontWeight: 700,
        color: ({active}) => active ? "white" : theme.palette.primary.main,
    },
    questionComment: {
        background: theme.palette.type === "dark" ? theme.palette.background.default : theme.palette.background.paper
    },
    questionButton:{
        borderRadius: "0 0 5px 5px",
        padding: "10px 0",
        color: theme.palette.common.white
    }
}))

const ReactionsToggle = ({setShowAllReactions, showAllReactions}) => {
    const classes = useStyles()
    return (
        <div className={classes.reactionsToggle} onClick={() => setShowAllReactions(!showAllReactions)}>
            {showAllReactions ? <ExpandLessRoundedIcon style={{marginRight: '3px', fontSize: "1.8em"}}/> :
                <ExpandMoreRoundedIcon style={{marginRight: '3px', fontSize: "1.8em"}}/>}
            <Typography className={classes.showText}>{showAllReactions ? 'Hide' : 'Show all reactions'}</Typography>
        </div>
    )
}

const QuestionContainer = ({
                               sliding,
                               user,
                               livestream,
                               streamer,
                               question,
                               questions,
                               firebase,
                               index,
                               isNextQuestions,
                               selectedState,
                               showMenu
                           }) => {

    const [newCommentTitle, setNewCommentTitle] = useState("");
    const [comments, setComments] = useState([]);
    const [showAllReactions, setShowAllReactions] = useState(false);
    const {authenticatedUser, userData} = useAuth();
    const {tutorialSteps, handleConfirmStep} = useContext(TutorialContext);

    const isEmpty = !(newCommentTitle.trim()) || (!userData && !livestream?.test)
    const active = question?.type === 'current'
    const old = question?.type !== 'new'
    const upvoted = (!user && !livestream?.test) || (question?.emailOfVoters ? question?.emailOfVoters.indexOf(livestream?.test ? 'streamerEmail' : authenticatedUser.email) > -1 : false)
    const classes = useStyles({active})


    useEffect(() => {
        if (livestream.id && question.id) {
            const unsubscribe = firebase.listenToQuestionComments(livestream.id, question.id, querySnapshot => {
                var commentsList = [];
                querySnapshot.forEach(doc => {
                    let comment = doc.data();
                    comment.id = doc.id;
                    commentsList.push(comment);
                });
                setComments(commentsList);
            });
            return () => unsubscribe();
        }
    }, [livestream.id, question.id]);

    useEffect(() => {
        if (active && !showAllReactions) {
            setShowAllReactions(true)
        }
    }, [active, question.type])

    function addNewComment() {
        if (!(newCommentTitle.trim()) || (!userData && !livestream?.test && !streamer)) {
            return;
        }


        const newComment = streamer ? {
            title: newCommentTitle,
            author: 'Streamer'
        } : {
            title: newCommentTitle,
            author: userData ? (userData.firstName + ' ' + userData.lastName.charAt(0)) : 'anonymous'
        }

        firebase.putQuestionComment(livestream.id, question.id, newComment)
            .then(() => {
                setNewCommentTitle("");
                setShowAllReactions(true);
            }, error => {
                console.log("Error: " + error);
            })
    }

    function addNewCommentOnEnter(target) {
        if (target.charCode == 13) {
            addNewComment();
            isOpen(2) && handleConfirmStep(2)
        }
    }

    function upvoteLivestreamQuestion() {
        let authEmail = livestream.test ? 'streamerEmail' : authenticatedUser.email;
        firebase.upvoteLivestreamQuestion(livestream.id, question, authEmail);
    }

    function goToThisQuestion(nextQuestionId) {
        const currentQuestion = questions.find(question => question.type === 'current');
        if (currentQuestion) {
            firebase.goToNextLivestreamQuestion(currentQuestion.id, nextQuestionId, livestream.id);
        } else {
            firebase.goToNextLivestreamQuestion(null, nextQuestionId, livestream.id);
        }
    }

    const isOpen = (property) => {
        return Boolean(livestream.test
            && showMenu
            && tutorialSteps.streamerReady
            && index === 0
            && tutorialSteps[property]
            && isNextQuestions
            && selectedState === "questions"
            && !sliding)
    }

    const componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank">
            {text}
        </a>
    );


    let commentsElements = comments.map((comment, index) => {
        return (
            <Slide key={comment.id} in direction="right">
                <Box className={classes.questionComment} borderRadius={8} mb={1} p={1} component={Card}>
                    <div style={{wordBreak: "break-word"}}>
                        <Linkify componentDecorator={componentDecorator}>
                            {comment.title}
                        </Linkify>
                    </div>
                    <div style={{fontSize: "0.8em", color: "rgb(160,160,160)"}}>
                        @{comment.author}
                    </div>
                </Box>
            </Slide>
        );
    });

    return (
        <Grow in>
            <WhiteTooltip
                placement="right-start"
                title={
                    <React.Fragment>
                        <TooltipTitle>Student Questions (1/3)</TooltipTitle>
                        <TooltipText>
                            These are the questions that students
                            already asked and upvoted before your event
                        </TooltipText>
                        <TooltipButtonComponent onConfirm={() => handleConfirmStep(0)} buttonText="Ok"/>
                    </React.Fragment>
                } open={isOpen(0)}>
                <Paper elevation={4} className={classes.questionContainer}>
                    <div style={{padding: "20px 20px 5px 20px"}}>
                        <div className={classes.upVotes}>
                            {question.votes} <ThumbUpRoundedIcon color="inherit"
                                                                 style={{verticalAlign: "text-top"}}
                                                                 fontSize='small'/>
                        </div>
                        <div className={classes.reactionsQuestion}>
                            {question.title}
                        </div>
                        <Typography style={{
                            fontSize: "1em",
                            verticalAlign: "middle",
                            fontWeight: 700,
                            color: active ? "white" : "rgb(200,200,200)",
                            marginBottom: "1rem"
                        }}>
                            {comments.length} reaction{comments.length !== 1 && "s"}
                        </Typography>
                        {commentsElements[0]}
                        <Collapse style={{width: "100%"}} in={showAllReactions}>
                            {commentsElements.slice(1)}
                        </Collapse>
                        {comments.length > 1 && <ReactionsToggle
                            setShowAllReactions={setShowAllReactions}
                            showAllReactions={showAllReactions}/>}
                    </div>
                    <WhiteTooltip
                        placement="right-start"
                        title={
                            <React.Fragment>
                                <TooltipTitle>Student Questions (3/3)</TooltipTitle>
                                <TooltipText>
                                    In the recruiter-chat a company HR representative can answer
                                    recruiting related questions. Try and type a comment.
                                </TooltipText>
                                <TooltipButtonComponent onConfirm={() => handleConfirmStep(2)} buttonText="Ok"/>
                            </React.Fragment>
                        } open={isOpen(2)}>
                        <Box p={1}>
                            <TextField
                                value={newCommentTitle}
                                className={classes.chatInput}
                                onKeyPress={addNewCommentOnEnter}
                                placeholder='Send a reaction...'
                                fullWidth
                                size="small"
                                variant="outlined"
                                InputProps={{
                                    maxLength: 340,
                                    endAdornment: <PlayIconButton
                                        isEmpty={isEmpty}
                                        addNewComment={() => {
                                            addNewComment()
                                            isOpen(2) && handleConfirmStep(2)
                                        }}/>,
                                }}
                                onChange={(event) => {
                                    setNewCommentTitle(event.currentTarget.value)
                                }}
                            />
                        </Box>
                    </WhiteTooltip>
                    {streamer ?
                        <WhiteTooltip
                            placement="right-start"
                            title={
                                <React.Fragment>
                                    <TooltipTitle>Student Questions (2/3)</TooltipTitle>
                                    <TooltipText>
                                        Before answering a question verbally, make
                                        sure to highlight the question with Answer Now
                                    </TooltipText>
                                    <TooltipButtonComponent onConfirm={() => {
                                        goToThisQuestion(question.id)
                                        handleConfirmStep(1)
                                    }} buttonText="Ok"/>
                                </React.Fragment>
                            } open={isOpen(1)}>
                            <Button
                                startIcon={<ThumbUpRoundedIcon/>}
                                children={active ? "Answering" : old ? "Answered" : "Answer Now"}
                                size='small'
                                disableElevation
                                disabled={old}
                                className={classes.questionButton}
                                fullWidth
                                color="primary"
                                onClick={() => {
                                    goToThisQuestion(question.id)
                                    isOpen(1) && handleConfirmStep(1)
                                }}
                                variant="contained"
                            />
                        </WhiteTooltip>
                        : <Button
                            startIcon={<ThumbUpRoundedIcon/>}
                            children={!livestream.test && (question.emailOfVoters && user && question.emailOfVoters.indexOf(user.email) > -1) ? 'UPVOTED!' : 'UPVOTE'}
                            size='small'
                            disableElevation
                            className={classes.questionButton}
                            color="primary"
                            fullWidth
                            variant="contained"
                            onClick={() => upvoteLivestreamQuestion()}
                            disabled={old || upvoted}/>}
                </Paper>
            </WhiteTooltip>
        </Grow>
    );
}


export default withFirebase(QuestionContainer);