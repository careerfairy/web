import React, {useState, useEffect, useContext} from 'react';
import UserContext from 'context/user/UserContext';
import {Button, Typography} from "@material-ui/core";
import QuestionContainer from './questions/QuestionContainer';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import {TextField, Collapse} from "@material-ui/core";

import DialogTitle from '@material-ui/core/DialogTitle';
import {withFirebase} from 'context/firebase';
import AddIcon from '@material-ui/icons/Add';
import Fab from "@material-ui/core/Fab";
import Box from "@material-ui/core/Box";
import {
    CategoryContainerTopAligned,
    QuestionContainerHeader,
    QuestionContainerTitle
} from "../../../../materialUI/GlobalContainers";
import Slide from "@material-ui/core/Slide";


function QuestionCategory({livestream, selectedState, user, streamer, firebase}) {
    const [showNextQuestions, setShowNextQuestions] = useState(true);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [touched, setTouched] = useState(false);

    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [pastQuestions, setPastQuestions] = useState([]);

    const [newQuestionTitle, setNewQuestionTitle] = useState("");

    const {authenticatedUser, userData} = useContext(UserContext);
    const handleOpen = () => {
        setTouched(false)
        setShowQuestionModal(true)
    }
    const handleClose = () => {
        setTouched(false)
        setShowQuestionModal(false)
    }
//
    useEffect(() => {
        if (livestream.id) {
            const unsubscribe = firebase.listenToLivestreamQuestions(livestream.id, querySnapshot => {
                var upcomingQuestionsList = [];
                var pastQuestionsList = [];
                querySnapshot.forEach(doc => {
                    let question = doc.data();
                    question.id = doc.id;
                    if (question.type !== 'done') {
                        upcomingQuestionsList.push(question);
                    } else {
                        pastQuestionsList.push(question);
                    }
                });
                setUpcomingQuestions(upcomingQuestionsList);
                setPastQuestions(pastQuestionsList);
            });
            return () => unsubscribe();
        }
    }, [livestream.id]);

    function addNewQuestion() {
        setTouched(true)
        if ((!userData && !livestream.test) || !(newQuestionTitle.trim()) || newQuestionTitle.trim().length < 5) {
            return;
        }

        const newQuestion = {
            title: newQuestionTitle,
            votes: 0,
            type: "new",
            author: !livestream.test ? authenticatedUser.email : 'test@careerfairy.io'
        }
        firebase.putLivestreamQuestion(livestream.id, newQuestion)
            .then(() => {
                setNewQuestionTitle("");
                handleClose()
            }, () => {
                console.log("Error");
            })
    }

    let upcomingQuestionsElements = upcomingQuestions.map((question, index) => {
        return (
            <div key={index}>
                <QuestionContainer showNextQuestions={showNextQuestions} streamer={streamer} appear={showNextQuestions}
                                   livestream={livestream}
                                   questions={upcomingQuestions} question={question} user={authenticatedUser}
                                   userData={userData}/>
            </div>
        );
    });

    let pastQuestionsElements = pastQuestions.map((question, index) => {
        return (
            <div key={index}>
                <QuestionContainer showNextQuestions={showNextQuestions} streamer={streamer} appear={!showNextQuestions}
                                   livestream={livestream}
                                   questions={pastQuestions} question={question} user={authenticatedUser}
                                   userData={userData}/>
            </div>
        );
    });


    return (
        <CategoryContainerTopAligned>
            <QuestionContainerHeader>
                <QuestionContainerTitle>
                    Questions
                </QuestionContainerTitle>
                {!streamer &&
                <Button variant="contained" style={{marginTop: "1rem"}} children='Add a Question'
                        endIcon={<AddIcon fontSize="large"/>}
                        color="primary" onClick={handleOpen}/>}
                <div style={{display: "flex", justifyContent: "center"}}>
                    <Fab size="small" variant="extended" onClick={() => setShowNextQuestions(true)} value="left"
                         style={{
                             background: showNextQuestions ? "Gray" : "#e0e0e0",
                             marginRight: "0.5rem",
                             color: showNextQuestions ? "white" : "black"
                         }}>
                        <Box fontSize={10}>Upcoming [{upcomingQuestionsElements.length}]</Box>
                    </Fab>
                    <Fab size="small" variant="extended" onClick={() => setShowNextQuestions(false)} value="center"
                         style={{
                             background: showNextQuestions ? "#E0E0E0" : "Gray",
                             marginLeft: "0.5rem",
                             color: showNextQuestions ? "black" : "white"
                         }}>
                        <Box fontSize={10}>Answered [{pastQuestionsElements.length}]</Box>
                    </Fab>
                </div>
            </QuestionContainerHeader>
            <Slide>
                {upcomingQuestionsElements}
            </Slide>
            <Slide>
                {pastQuestionsElements}
            </Slide>
            <Dialog PaperProps={{style: {background: "transparent", boxShadow: "none"}}} fullWidth onClose={handleClose}
                    open={showQuestionModal} basic size='small'>
                <DialogTitle style={{color: "white"}}>
                    Add a Question
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        InputProps={{style: {background: "white"}}}
                        error={Boolean(touched && newQuestionTitle.length < 5)}
                        onBlur={() => setTouched(true)}
                        variant="outlined" value={newQuestionTitle} placeholder='Your question goes here'
                        onChange={({currentTarget: {value}}, element) => {
                            setNewQuestionTitle(value)
                        }} fullWidth/>
                    <Collapse in={Boolean(touched && newQuestionTitle.length < 4)}>
                        <Typography style={{paddingLeft: "1rem"}} color="error">
                            Needs to be at least 5 characters
                        </Typography>
                    </Collapse>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" size='large'
                            onClick={() => addNewQuestion()}>
                        Submit
                    </Button>
                    <Button variant="contained" size='large' onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </CategoryContainerTopAligned>
    );
}

export default withFirebase(QuestionCategory);