import { Fragment, useState, useEffect } from 'react';
import { Grid, Image, Button, Icon, Modal, Step, Input } from "semantic-ui-react";

import { useRouter } from 'next/router';
import { withFirebasePage } from "../../../context/firebase";
import DateUtil from '../../../util/DateUtil';
import TargetElementList from '../common/TargetElementList';
import BookingModal from '../common/booking-modal/BookingModal';

import Link from 'next/link';


function QuestionVotingBox(props) {

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
        <div className='streamNextQuestionContainer'>
            <p style={{ marginBottom: '5px' }}>{ props.question.title }</p>
            <div className='bottom-element'>
                <Button icon='thumbs up' size='large' content='Upvote' onClick={() => upvoteLivestreamQuestion(props.user, props.question)} disabled={userHasVotedOnQuestion(props.user, props.question)} primary/>
                <div className='streamNextQuestionNumberOfVotes'>{ props.question.votes } <Icon name='thumbs up'/></div>
            </div>
            <style jsx>{`
                .streamNextQuestionContainer {
                    position: relative;
                    margin: 20px 0;
                    box-shadow: 0 0 3px grey;
                    border-radius: 10px;
                    color: rgb(50,50,50);
                    background-color: white;
                    padding: 30px 30px 100px 30px;
                    font-weight: 500;
                    font-size: 1.3em;
                    height: 100%;
                    min-height: 200px;
                    text-align: center;
                }

                .streamNextQuestionContainer .question-upvotes {
                    margin: 10px 0;
                    font-size: 0.9em;
                    font-weight: bold;
                }

                .streamNextQuestionNumberOfVotes {
                    font-weight: 600;
                    font-size: 1.3em;
                    border-radius: 5px;
                    display: block;
                    color: rgb(210,210,210);
                    font-size: 0.8em;
                    margin-top: 10px;
                }

                .bottom-element {
                    position: absolute;
                    bottom: 15px;
                    left: 0;
                    right: 0;
                    width: 100%;
                    text-align: center;
                }

                .right-votes {
                    position: absolute;
                    right: 0;
                    top: 15px;
                    color: rgb(130,130,130);
                    font-size: 0.8em;
                }
            `}</style>
        </div>
    );
}

export default withFirebasePage(QuestionVotingBox);