import React, {useState, useEffect} from 'react';
import {Input, Icon, Button, Label} from "semantic-ui-react";

import QuestionContainer from './question-container/QuestionContainer';

import { withFirebase } from '../../../../data/firebase';
import FirebaseRest from '../../../../data/firebase/FirebaseRest';
import FireStoreParser from 'firestore-parser';

function CommentContainer(props) {
    
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        if (props.livestream.id) {
            updateQuestions();
            const interval = setInterval(() => {
                updateQuestions();
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [props.livestream.id]);

    function updateQuestions() {
        FirebaseRest.getScheduledLivestreamQuestions(props.livestream.id).then(response => {
            var questionsList = [];
            response.data.forEach(doc => {
                let question = FireStoreParser(doc.document.fields);
                let nameArray = doc.document.name.split('/');
                let questionFinal = question;
                questionFinal.id = nameArray[nameArray.length - 1];
                questionFinal.timestamp = props.firebase.getFirebaseTimestamp(question.timestamp);
                if (questionFinal.type !== 'done') {
                    questionsList.push(questionFinal);
                }
            });
            setQuestions(questionsList);
        });
    }

    let questionsElements = questions.map((question, index) => {
        return (
            <div key={index}>
                <QuestionContainer livestream={ props.livestream } questions={questions} question={ question } updateQuestions={() => updateQuestions()} user={props.user} userData={props.userData}/>
            </div>       
        );
    });

    return (
        <div>
            <div className={'chat-container'}>
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
                    top: 0;
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
          `}</style>
        </div>
    );
}

export default withFirebase(CommentContainer);