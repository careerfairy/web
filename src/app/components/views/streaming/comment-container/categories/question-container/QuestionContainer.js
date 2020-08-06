import React, {useState, useEffect} from 'react';
import {Input, Icon, Button, Label} from "semantic-ui-react";

import { withFirebase } from 'data/firebase';

function QuestionContainer(props) {

    function goToThisQuestion(nextQuestionId) {
        const currentQuestion = props.questions.find(question => question.type === 'current');
        if (currentQuestion) {
            props.firebase.goToNextLivestreamQuestion(currentQuestion.id, nextQuestionId, props.livestream.id);
        } else {
            props.firebase.goToNextLivestreamQuestion(null, nextQuestionId, props.livestream.id);
        }
    }

    return (
        <div className='animated fadeInUp faster'>
                <div className={'questionContainer ' + (props.question.type === 'current' ? 'active' : '') }>
                    <div className='questionTitle'>
                        { props.question.title }
                    </div>
                    <div className='questionAuthor'>
                        by { props.question.author }
                    </div>
                </div>
                <div className='upvotes' style={{ color: props.question.type === 'current' ?  'white' : 'rgb(0, 210, 170)'}}>
                    <div className='number' >
                        { props.question.votes }
                    </div>
                    <Icon name='thumbs up'/>
                </div>
                <Button attached='bottom' icon='thumbs up' content={ 'ANSWER THIS QUESTION' } primary onClick={() => goToThisQuestion(props.question.id)} style={{ margin: '0 10px 10px 10px' }} disabled={props.question.type !== 'new'}/>
                <style jsx>{`
                    .questionContainer {
                        position: relative;
                        padding: 30px 20px 30px 20px;
                        margin: 10px 10px 0 10px;
                        background-color: rgb(250,250,250);
                        border-top-left-radius: 5px;
                        border-top-right-radius: 5px;
                        box-shadow: 0 0 5px rgb(180,180,180);
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
                        width: 90%;
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
                        color: rgba(0, 210, 170, 0.5);
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
                        right: 15px;
                        display: inline-block;
                        margin: 0 0 0 30px;
                        font-weight: 700; 
                        font-size: 1.2em;
                    }

                    .upvotes .number {
                        display: inline-block;
                        margin: 3px;
                    }

                    .comment-input {
                        position: absolute;
                        bottom: 5px;
                        left: 5px;
                        right: 5px;
                    }
                `}</style>
            </div>
    );
}

export default withFirebase(QuestionContainer);