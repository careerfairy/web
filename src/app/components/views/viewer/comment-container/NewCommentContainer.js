import React, {useState, useEffect} from 'react';
import {Input, Icon, Button, Header, Modal} from "semantic-ui-react";

import QuestionContainer from 'question-container/QuestionContainer';

import { withFirebase } from 'data/firebase';
import { animateScroll } from 'react-scroll';
import { setNestedObjectValues } from 'formik';

function CommentContainer(props) {
    const [showNextQuestions, setShowNextQuestions] = useState(true);
    const [showQuestionModal, setShowQuestionModal] = useState(false);

    const [newQuestionTitle, setNewQuestionTitle] = useState("");

    function addNewQuestion() {
        if (!props.userData ||!(newQuestionTitle.trim()) || newQuestionTitle.trim().length < 5) {
            return;
        }

        const newQuestion = {
            title: newQuestionTitle,
            votes: 0,
            type: "new",
            author: !props.livestream.test ? props.user.email : 'test@careerfairy.io'
        }
        props.firebase.putLivestreamQuestion(props.livestream.id, newQuestion)
            .then(() => {
                setNewQuestionTitle("");
                setShowQuestionModal(false);
            }, () => {
                console.log("Error");
        })
    }

    let upcomingQuestionsElements = props.upcomingQuestions.map((question, index) => {
        return (
            <div key={index}>
                <QuestionContainer livestream={ props.livestream } questions={props.upcomingQuestions} question={ question } user={props.user} userData={props.userData}/>
            </div>       
        );
    });

    let pastQuestionsElements = props.pastQuestions.map((question, index) => {
        return (
            <div key={index}>
                <QuestionContainer livestream={ props.livestream } questions={props.pastQuestions} question={ question } user={props.user} userData={props.userData}/>
            </div>       
        );
    });

    return (
        <div>
            <div className='questionToggle'>
                <div className='questionToggleTitle'>
                    Questions
                </div>
                <Button content='Add a Question' icon='add' style={{ position: 'absolute', top: '45px', left: '50%', transform: 'translateX(-50%)'}} primary onClick={() => setShowQuestionModal(true)}/> 
                <div className='questionToggleSwitches'>
                    <div className={'questionToggleSwitch ' + (showNextQuestions ? 'active'  : '')} onClick={() => setShowNextQuestions(true)}>
                        Upcoming [{ props.upcomingQuestions.length }]
                    </div>
                    <div className={'questionToggleSwitch ' + (showNextQuestions ? ''  : 'active')} onClick={() => setShowNextQuestions(false)}>
                        Answered [{ props.pastQuestions.length }]
                    </div>
                </div>
            </div>
            <div className='chat-container'>
                <div className={'chat-scrollable ' + (showNextQuestions ? ''  : 'hidden')}>
                    { upcomingQuestionsElements }
                </div>
                <div className={'chat-scrollable ' + (showNextQuestions ? 'hidden'  : '')}>
                    { pastQuestionsElements }
                </div>
            </div>
            <Modal open={showQuestionModal} basic size='small'>
                <Header content='Add a Question'/>
                <Modal.Content>
                    <Input type='text' size='huge' value={newQuestionTitle} onChange={(event, element) => {setNewQuestionTitle(element.value)}} placeholder='Your question goes here' fluid />
                </Modal.Content>
                <Modal.Actions>
                    <Button primary size='large' onClick={() => addNewQuestion()}>
                        Submit
                    </Button>
                    <Button size='large' onClick={() => setShowQuestionModal(false)}>
                        Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
            <style jsx>{`

                .questionToggle {
                    position: relative;
                    height: 150px;
                    box-shadow: 0 4px 2px -2px rgb(200,200,200);
                    z-index: 9000;
                }

                .questionToggleTitle {
                    position: absolute;
                    top: 15px;
                    width: 100%;
                    font-size: 1.2em;
                    font-weight: 500;
                    text-align: center;
                }

                .questionToggleSwitches {
                    position: absolute;
                    bottom: 10px;
                    width: 100%;
                    text-align: center;
                }

                .questionToggleSwitch {
                    display: inline-block;
                    padding: 10px 15px;
                    border-radius: 20px;
                    margin: 0 15px;
                    font-weight: 600;
                    font-size: 0.9em;
                    color: rgb(120,120,120);
                    background-color: rgb(240,240,240);
                    cursor: pointer;
                }

                .questionButton {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100%;
                    height: 42px;
                    box-shadow: 0 -4px 2px -2px rgb(200,200,200);
                }

                .questionToggleSwitch.active {
                    background-color: rgb(120, 120, 120);
                    color: white;
                    cursor: default;
                }

                .hidden {
                    display: none;
                }

                .chat-container {
                    position: absolute;
                    top: 150px;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    background-color: rgb(220,220,220);
                }

                @media(max-width: 768px) {

                }

                @media(min-width: 768px) {
                    .chat-scrollable {
                        position: absolute;
                        top: 0;
                        left: 0;
                        bottom: 0;
                        width: 100%;
                        overflow-y: scroll;
                        overflow-x: hidden;
                    }
                }

                ::-webkit-scrollbar {
                    width: 5px;
                }

                ::-webkit-scrollbar-thumb {
                    background-color: rgb(130,130,130);
                }
          `}</style>
        </div>
    );
}

export default withFirebase(CommentContainer);