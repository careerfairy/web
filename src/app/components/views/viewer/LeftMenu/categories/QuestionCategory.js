import React, {useState, useEffect, useContext} from 'react';
import UserContext from 'context/user/UserContext';
import {Button, fade, Typography} from "@material-ui/core";
import QuestionContainer from './questions/QuestionContainer';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import {TextField, Collapse} from "@material-ui/core";

import DialogTitle from '@material-ui/core/DialogTitle';
import {withFirebase} from 'context/firebase';
import AddIcon from '@material-ui/icons/Add';


function QuestionCategory({ livestream, selectedState, user, streamer, firebase}) {
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
                <QuestionContainer showNextQuestions={showNextQuestions} streamer={streamer} appear={showNextQuestions} livestream={livestream}
                                   questions={upcomingQuestions} question={question} user={authenticatedUser}
                                   userData={userData}/>
            </div>
        );
    });

    let pastQuestionsElements = pastQuestions.map((question, index) => {
        return (
            <div key={index}>
                <QuestionContainer showNextQuestions={showNextQuestions} streamer={streamer} appear={!showNextQuestions} livestream={livestream}
                                   questions={pastQuestions} question={question} user={authenticatedUser}
                                   userData={userData}/>
            </div>
        );
    });


    return (
        <>
            <div className='questionToggle'>
                <div className='questionToggleTitle'>
                    Questions
                </div>
                {!streamer && <Button variant="contained" children='Add a Question' endIcon={<AddIcon fontSize="large"/>}
                         color="primary" onClick={handleOpen}/>}
                <div className='questionToggleSwitches'>
                    <div className={'questionToggleSwitch ' + (showNextQuestions ? 'active' : '')}
                         onClick={() => setShowNextQuestions(true)}>
                        Upcoming [{upcomingQuestionsElements.length}]
                    </div>
                    <div className={'questionToggleSwitch ' + (showNextQuestions ? '' : 'active')}
                         onClick={() => setShowNextQuestions(false)}>
                        Answered [{pastQuestionsElements.length}]
                    </div>
                </div>
            </div>
            <div>
                <div>
                    {upcomingQuestionsElements}
                </div>
                <div unmountOnExit in={!showNextQuestions}>
                    {pastQuestionsElements}
                </div>
            </div>
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
            <style jsx>{`

                .questionToggle {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-around;
                    box-shadow: 0 4px 2px -2px rgb(200,200,200);
                    z-index: 9000;
                    background-color: white;
                }
                
                .questionToggle > * {
                  margin-top: 1rem;
                }
                
                .questionToggle > *:not(:first-child) {
                  margin-bottom: 1rem;
                }

                .questionToggleTitle {
                    width: 100%;
                    font-size: 1.2em;
                    font-weight: 500;
                    text-align: center;
                }

                .questionToggleSwitches {
                    width: 100%;
                    text-align: center;
                }

                .questionToggleSwitch {
                    display: inline-block;
                    padding: 8px 12px;
                    border-radius: 20px;
                    margin: 0 5px;
                    font-weight: 600;
                    font-size: 0.8em;
                    color: rgb(120,120,120);
                    background-color: rgb(240,240,240);
                    cursor: pointer;
                }

                .questionToggleSwitch.active {
                    background-color: rgb(120, 120, 120);
                    color: white;
                    cursor: default;
                }

                .hidden {
                    display: none;
                }

                ::-webkit-scrollbar {
                    width: 5px;
                }

                ::-webkit-scrollbar-thumb {
                    background-color: rgb(130,130,130);
                }
          `}</style>
        </>
    );
}

export default withFirebase(QuestionCategory);