import React, {useState, useEffect, useContext} from 'react';
import Slide from '@material-ui/core/Slide';
import ThumbUpRoundedIcon from '@material-ui/icons/ThumbUpRounded';
import Linkify from 'react-linkify';
import ExpandLessRoundedIcon from '@material-ui/icons/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import {withFirebase} from 'context/firebase';
import UserContext from 'context/user/UserContext';
import {Box, Button, fade, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {grey} from "@material-ui/core/colors";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightRoundedIcon from "@material-ui/icons/ChevronRightRounded";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
    sendIcon: {
        background: "white",
        color: ({isEmpty}) => isEmpty ? "grey" : theme.palette.primary.main,
        borderRadius: "50%",
        fontSize: 15
    },
    sendBtn: {
        width: 30,
        height: 30,
        background: fade(theme.palette.primary.main, 0.5),
        "&$buttonDisabled": {
            color: grey[800]
        },
        "&:hover": {
            backgroundColor: theme.palette.primary.main,
        },
        margin: "0.5rem"
    },
    buttonDisabled: {},
    chatInput: {
        borderRadius: 10,
        "& .MuiInputBase-root": {
            paddingRight: "0 !important",
            borderRadius: 10,
        },
        background: "white"
    },
}))


function QuestionContainer({user, livestream, streamer, appear, question, questions, firebase}) {
    const [newCommentTitle, setNewCommentTitle] = useState("");
    const [comments, setComments] = useState([]);
    const [showAllReactions, setShowAllReactions] = useState(false);
    const {authenticatedUser, userData} = useContext(UserContext);

    const isEmpty = !(newCommentTitle.trim()) || (!userData && !livestream.test)
    const classes = useStyles({isEmpty})


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

    function addNewComment() {
        if (!(newCommentTitle.trim()) || (!userData && !livestream.test && !streamer)) {
            return;
        }


        const newComment = streamer ? {
            title: newCommentTitle,
            author: userData ? (userData.firstName + ' ' + userData.lastName.charAt(0)) : 'anonymous',
        } : {
            title: newCommentTitle,
            author: 'Streamer',
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
        }
    }

    function upvoteLivestreamQuestion() {
        let authEmail = livestream.test ? 'streamerEmail' : authenticatedUser.email;
        firebase.upvoteLivestreamQuestion(livestream.id, question, authEmail);
    }

    const componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank">
            {text}
        </a>
    );


    let commentsElements = comments.map((comment, index) => {
        return (
            <div className='animated fadeInUp faster' key={comment.id}>
                <div className='questionContainer'>
                    <div className='questionTitle'>
                        <Linkify componentDecorator={componentDecorator}>
                            {comment.title}
                        </Linkify>
                    </div>
                    <div className='questionAuthor'>
                        @{comment.author}
                    </div>
                </div>
                <style jsx>{`
                    .questionContainer {
                        position: relative;
                        padding: 10px;
                        margin: 6px 0 3px 0;
                        background-color: white;
                        color: black;
                        border-radius: 10px;
                        box-shadow: 0 0 5px rgb(180,180,180);
                        font-size: 0.9em;
                    }

                    .questionTitle {
                        word-break: break-word;
                    }

                    .questionAuthor {
                        font-size: 0.8em;
                        color: rgb(160,160,160);
                    }
                `}</style>
            </div>
        );
    });

    if (!showAllReactions) {
        commentsElements = commentsElements.slice(0, 1);
    }

    const playIcon = (<div>
        <IconButton classes={{root: classes.sendBtn, disabled: classes.buttonDisabled}} disabled={isEmpty}
                    onClick={() => addNewComment()}>
            <ChevronRightRoundedIcon className={classes.sendIcon}/>
        </IconButton>
    </div>)

    const ReactionsToggle = () => {
        if (comments.length < 2) {
            return null;
        }

        return (
            <div className='reactions-toggle' onClick={() => setShowAllReactions(!showAllReactions)}>
                {showAllReactions ? <ExpandLessRoundedIcon style={{marginRight: '3px', fontSize: "1.8em"}}/> :
                    <ExpandMoreRoundedIcon style={{marginRight: '3px', fontSize: "1.8em"}}/>}
                <Typography style={{
                    color: "rgb(210,210,210)",
                    fontSize: "0.8em",
                    fontWeight: 500
                }}>{showAllReactions ? 'Hide' : 'Show all reactions'}</Typography>
                <style jsx>{`
                    .reactions-toggle {
                        margin: 5px 0 0 0;
                        text-transform: uppercase;
                        cursor: pointer;
                        color: rgb(210,210,210);
                        display: flex;
                        align-items: center;
                    }
                `}</style>
            </div>
        )
    }

    return (
        <Slide in={appear} direction="right">
            <div className='animated fadeInUp faster'>
                <div className={'questionContainer ' + (question.type === 'current' ? 'active' : '')}>
                    <div style={{padding: "20px 20px 5px 20px"}}>
                        <div className='questionTitle'>
                            {question.title}
                        </div>
                        <div className='bottom-element'>
                            <div className='comments'>
                                <p className='comments-number'>{comments.length} reactions</p>
                            </div>
                        </div>
                        <div>
                            {commentsElements}
                        </div>
                        <ReactionsToggle/>
                        <div style={{color: question.type === 'current' ? "white" : "auto"}} className='upvotes'>
                            {question.votes} <ThumbUpRoundedIcon color="inherit"
                                                                 style={{verticalAlign: "text-top"}}
                                                                 fontSize='small'/>
                        </div>
                    </div>
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
                                endAdornment: playIcon,
                            }}
                            onChange={(event) => {
                                setNewCommentTitle(event.currentTarget.value)
                            }}
                        />
                    </Box>
                    {!!streamer && <Button
                        startIcon={<ThumbUpRoundedIcon/>}
                        children={!livestream.test && (question.emailOfVoters && user && question.emailOfVoters.indexOf(user.email) > -1) ? 'UPVOTED!' : 'UPVOTE'}
                        size='small'
                        style={{borderRadius: "0 0 5px 5px"}}
                        disableElevation
                        color="primary"
                        fullWidth
                        variant="contained"
                        onClick={() => upvoteLivestreamQuestion()}
                        disabled={(question.type !== 'new' || (!user && !livestream.test) || (question.emailOfVoters ? question.emailOfVoters.indexOf(livestream.test ? 'streamerEmail' : authenticatedUser.email) > -1 : false))}/>}
                </div>
                <style jsx>{`
                    .questionContainer {
                        position: relative;
                        padding: 20px 0 0 0;
                        margin: 10px 10px 0 10px;
                        background-color: rgb(250,250,250);
                        border-radius: 5px;
                        box-shadow: 0 0 5px rgb(180,180,180);
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }

                    .questionContainer.active {
                        background-color: rgb(0, 210, 170);
                        color: white;
                    }

                    .questionContainer.past {
                        opacity: 0.6;
                    }

                    .questionTitle {
                        font-weight: 700;
                        font-size: 1.3em;
                        line-height: 1.3em;
                        color: rgb(50,50,50);
                        margin: 5px 0;
                        width: 85%;
                        word-break: break-word;
                    }

                    .questionContainer.active .questionTitle {
                        color: white;
                    }

                    .questionAuthor {
                        font-size: 0.8em;
                        color: rgb(130,130,130);
                    }

                    .questionContainer.active .questionAuthor {
                        color: white;
                    }

                    .bottom-element {
                        margin-top: 5px;
                        color: rgb(200,200,200);
                        font-size: 0.9em;  
                        font-weight: 700; 
                    }

                    .questionContainer.active .bottom-element {
                        color: white;
                    }

                    .comments {
                        font-size: 1em;     
                        display: inline-block;
                        text-transform: uppercase;
                    }

                    .comments-number {
                        font-size: 1em;    
                        vertical-align: middle;
                        margin: 0;
                    }

                    .comments-add {
                        font-size: 0.9em;    
                        margin: 0;
                        color: rgb(0, 210, 170);
                        cursor: pointer;
                    }

                    .upvotes {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        font-size: 1.2em;
                        display: inline-block;
                        margin: 0 0 0 30px;
                        font-weight: 700; 
                        color: rgba(0, 210, 170, 1);
                    }
                `}</style>
            </div>
        </Slide>
    );
}

export default withFirebase(QuestionContainer);