import React, {useState, useEffect} from 'react';
import {Input, Icon, Button, Label, Modal} from "semantic-ui-react";

import QuestionContainer from './question-container/QuestionContainer';

import { withFirebase } from '../../../../data/firebase';
import { animateScroll } from 'react-scroll';

function CommentContainer(props) {
    
    const [questions, setQuestions] = useState([]);
    const [newQuestionTitle, setNewQuestionTitle] = useState("");    
    const [questionSubmittedModalOpen, setQuestionSubmittedModalOpen] = useState(false);


    useEffect(() => {
        if (props.livestream.id) {
            const unsubscribe = props.firebase.listenToLivestreamQuestions(props.livestream.id, querySnapshot => {
                var questionsList = [];
                querySnapshot.forEach(doc => {
                    let question = doc.data();
                    question.id = doc.id;
                    if (question.type !== 'done') {
                        questionsList.push(question);
                    }
                });
                setQuestions(questionsList);
            });
            return () => unsubscribe();
        }
    }, [props.livestream.id]);
    
    let questionsElements = questions.map((question, index) => {
        return (
            <div key={question.title}>
                <QuestionContainer livestream={ props.livestream } question={ question } user={props.user} userData={props.userData}/>
            </div>       
        );
    });

    return (
        <div>
            <div className={'chat-container'}>  
                <div  className='chat-hint'>Most upvoted questions will be answered first</div>
                <div className='chat-scrollable'>
                    { questionsElements }
                </div>
            </div>
            <style jsx>{`
                .hidden {
                    display: none;
                }

                .video-menu-left {
                    position: absolute;
                    top: 75px;
                    left: 0;
                    bottom: 0;
                    width: 330px;
                    z-index: 1;
                }

                .chat-hint {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    background-color: white;
                    text-align: center;
                    padding: 15px 0;
                    text-transform: uppercase;
                    font-size: 0.9em;
                    color: white;
                    background-color: rgb(0, 210, 170);
                    font-weight:700;
                }

                .chat-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    background-color: rgb(220,220,220);
                }

                .chat-scrollable {
                    position: absolute;
                    top: 50px;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    overflow-y: scroll;
                    overflow-x: hidden;
                }

                ::-webkit-scrollbar {
                    width: 5px;
                }

                ::-webkit-scrollbar-thumb {
                    background-color: rgb(130,130,130);
                }

                .chat-container.active {
                    top: 190px;
                }

                .video-menu-left-reactions {
                    width: 100%;
                    height: 60px;
                    text-align: center;
                    padding: 5px;
                    font-size: 0.8em;
                    font-weight: 700;
                    color: rgba(0, 210, 170, 0.7);
                }

                .video-menu-left-outer-content::-webkit-scrollbar {
                    width: 5px;
                    background-color: white;
                }

                .video-menu-left-outer-content {
                    width: 100%;
                    position: absolute;
                    top: 60px;
                    left: 0;
                    bottom: 40px;                   
                    overflow: scroll;
                    overflow-x: hidden;    
                    z-index: 3;
                    box-shadow: inset 0 0 5px grey;
                }

                .no-comment-message {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    color: rgb(255, 20, 147);
                }

                .video-menu-left-input {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 40px;
                    width: 100%;
                }

                .video-menu-left-content {
                    height: 100%;
                    width: 100%;
                    padding: 10px 20px;
                }

                @media (max-width: 768px) {
                    .chat-scrollable {
                        overflow-y: visible;
                        overflow-x: visible;
                    } 

                    .chat-container {
                        background-color: white;
                    }
                }
          `}</style>
        </div>
    );
}

export default withFirebase(CommentContainer);