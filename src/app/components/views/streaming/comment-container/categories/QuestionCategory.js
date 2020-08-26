import React, {useState, useEffect} from 'react';

import QuestionContainer from './questions/question-container/QuestionContainer';

import { withFirebase } from 'context/firebase';
import { Icon } from 'semantic-ui-react';

function QuestionCategory(props) {

    if (props.selectedState !== 'questions') {
        return null;
    }
    
    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [pastQuestions, setPastQuestions] = useState([]);

    const [showNextQuestions, setShowNextQuestions] = useState(true);

    useEffect(() => {
        if (props.livestream.id) {
            const unsubscribe = props.firebase.listenToLivestreamQuestions(props.livestream.id, querySnapshot => {
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
    }, [props.livestream.id]);

    let upcomingQuestionsElements = upcomingQuestions.map((question, index) => {
        return (
            <div key={index}>
                <QuestionContainer livestream={ props.livestream } questions={upcomingQuestions} question={ question } user={props.user} userData={props.userData}/>
            </div>       
        );
    });

    let pastQuestionsElements = pastQuestions.map((question, index) => {
        return (
            <div key={index}>
                <QuestionContainer livestream={ props.livestream } questions={pastQuestions} question={ question } user={props.user} userData={props.userData}/>
            </div>       
        );
    });

    return (
        <div>
            <div className='questionToggle'>
                <div className='questionToggleTitle'>
                    <Icon name='question circle outline' color='teal'/> Q&A
                </div>
                <div className='questionToggleSwitches'>
                    <div className={'questionToggleSwitch ' + (showNextQuestions ? 'active'  : '')} onClick={() => setShowNextQuestions(true)}>
                        Upcoming [{ upcomingQuestions.length }]
                    </div>
                    <div className={'questionToggleSwitch ' + (showNextQuestions ? ''  : 'active')} onClick={() => setShowNextQuestions(false)}>
                        Answered [{ pastQuestions.length }]
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
            <style jsx>{`
                .questionToggle {
                    position: relative;
                    height: 100px;
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
                    padding: 8px 12px;
                    border-radius: 20px;
                    margin: 0 10px;
                    font-weight: 600;
                    font-size: 0.8em;
                    color: rgb(120,120,120);
                    background-color: rgb(240,240,240);
                    cursor: pointer;
                }

                .questionToggleSwitch.active {
                    background-color: rgb(0, 210, 170);
                    color: white;
                    cursor: default;
                }

                .hidden {
                    display: none;
                }

                .chat-container {
                    position: absolute;
                    top: 100px;
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
          `}</style>
        </div>
    );
}

export default withFirebase(QuestionCategory);