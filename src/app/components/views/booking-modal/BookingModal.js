import {Fragment, useState, useEffect} from 'react'
import { Icon, Button, Modal, Header, Step, Grid, Input, Image } from "semantic-ui-react";

import CommonUtil from '../../../util/CommonUtil';
import QuestionVotingBox from '../question-voting-box/QuestionVotingBox';

import { withFirebase } from "../../../data/firebase";

function BookingModal(props) {

    const [modalStep, setModalStep] = useState(0);

    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [questionsAvailable, setQuestionsAvailable] = useState(false);
    const [questionsVoted, setQuestionsVoted] = useState(false);
    const [questionAsked, setQuestionAsked] = useState(false);

    const [newQuestionTitle, setNewQuestionTitle] = useState("");

    const avatar = props.livestream.mainSpeakerAvatar ? props.livestream.mainSpeakerAvatar : 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fplaceholder.png?alt=media';

    useEffect(() => {
        if (props.livestream.id) {
            props.firebase.getScheduledLivestreamsUntreatedQuestions(props.livestream.id, querySnapshot => {
                var questionsList = [];
                querySnapshot.forEach(doc => {
                    let question = doc.data();
                    question.id = doc.id;
                    questionsList.push(question);
                });
                setUpcomingQuestions(questionsList);
            });
        }
    }, [props.livestream]);

    useEffect(() => {
        if (upcomingQuestions.length > 3) {
            setQuestionsAvailable(true);
        }
        let upvotedQuestions = upcomingQuestions.filter(question => {
            if (!question.emailOfVoters || !props.user) {
                return false;
            }
            return question.emailOfVoters.indexOf(props.user.email) > -1;
        });
        if (upvotedQuestions.length > 1) {
            setQuestionsVoted(true);
        }
        let authoredQuestions = upcomingQuestions.filter(question => {
            if (!props.user) {
                return false;
            }
            return question.author === props.user.email;
        });
        if (authoredQuestions.length > 0) {
            setQuestionAsked(true);
        }
    }, [upcomingQuestions]);

    useEffect(() => {
        if (questionsAvailable && !questionsVoted) {
            setModalStep(0);
        } else if ((!questionsAvailable || questionsVoted) && !questionAsked) {
            setModalStep(1);
        } else if (questionAsked) {
            setModalStep(2);
        }
    }, [questionsAvailable, questionsVoted, questionAsked]);

    function performConfirmAction() {
        props.buttonAction();
        setModalOpen(false);
    }

    function addNewQuestion() {
        if (!props.user) {
            return router.replace('/signup');
        }
        
        const newQuestion = {
            title: newQuestionTitle,
            votes: 0,
            type: "new",
            author: props.user.email
        }

        props.firebase.putScheduledLivestreamsQuestion(props.livestream.id, newQuestion)
            .then(() => {
                setNewQuestionTitle("");
                setModalStep(2);
            }, () => {
                console.log("Error");
            })
    }

    function joinTalentPool() {
        props.firebase.joinCompanyTalentPool(props.livestream.companyId, props.user.email).then(() => {
            props.setModalOpen(false);
        });
    }

    let questionElements = CommonUtil.getRandom(upcomingQuestions, 9).map((question, index) => {
        return (
            <Grid.Column key={index}>
                <QuestionVotingBox question={question} user={props.user} livestream={props.livestream}/>
            </Grid.Column>
        );
    });

    return (
        <Fragment>
            <Modal style={{ zIndex: '9999' }} open={props.modalOpen} onClose={() => props.setModalOpen(false)}>
                    <Modal.Content>
                        <Image src={props.livestream.companyLogoUrl} style={{ maxHeight: '120px', maxWidth: '200px', margin: '20px auto'}}/>
                        <h2 className='booking-modal-title'><Icon name='check circle'/>Your spot is secured!</h2>
                        <div className={ modalStep !== 0 ? 'hidden' : 'modalStep'}>
                            <h4 className='booking-modal-subtitle'>Upvote 2 questions from your peers</h4>
                            <div className={ questionElements.length < 4 ? 'hidden' : ''}>
                                <Grid stackable columns={3}>
                                    { questionElements }
                                </Grid>
                            </div>
                            <Button style={{ margin: '50px 0 0 0'}}  fluid content='Skip' onClick={() => setModalStep(1)} size='large'/>
                        </div>
                        <div className={ modalStep !== 1 ? 'hidden' : 'modalStep'}>
                            <h4 className='booking-modal-subtitle'>Ask your question to the speaker</h4>
                            <div className='livestream-streamer-description'>
                                <div className='livestream-speaker-avatar-capsule'>
                                    <div className='livestream-speaker-avatar' style={{ backgroundImage: 'url(' + avatar + ')'}}/>
                                </div>
                                <div className='livestream-streamer'>
                                    <div className='livestream-streamer-name'>{ props.livestream.mainSpeakerName }</div>
                                    <div className='livestream-streamer-position'>{ props.livestream.mainSpeakerPosition }</div>
                                    <div className='livestream-streamer-position'>{ props.livestream.mainSpeakerBackground }</div>
                                </div>
                            </div>
                            <Input size='huge' value={newQuestionTitle} placeholder={'What would like to ask our speaker?'} onChange={(event) => setNewQuestionTitle(event.target.value)} fluid/>
                            <Button style={{ margin: '20px 0 0 0'}} primary fluid content='Submit' onClick={() => addNewQuestion()} size='large'/>
                            <Button style={{ margin: '10px 0 0 0'}}  fluid content='Skip' onClick={() => setModalStep(2)} size='large'/>
                        </div>
                        <div className={ modalStep !== 2 ? 'hidden' : 'modalStep'}>
                            <h4 className='booking-modal-subtitle'>Join the { props.livestream.company } Talent Pool</h4>
                            <div>Join { props.livestream.company }'s Talent Pool and be contacted directly in case any relevant opportunity arises for you at { props.livestream.company } in the future. By joining the Talent Pool, you agree that your profile data will be shared with { props.livestream.company }. Don't worry, you can leave a Talent Pool at any time.</div>
                            <Button style={{ margin: '20px 0 0 0'}} content='Join Talent Pool' primary fluid size='large' onClick={() => joinTalentPool()}/>
                            <Button style={{ margin: '10px 0 0 0'}} content='No thanks' fluid size='large' onClick={() => props.setModalOpen(false)}/>
                        </div>
                    </Modal.Content>
                </Modal>
                <style jsx>{`
                .hidden {
                    display: none
                }

                .booking-modal-title {
                    color: rgb(0, 210, 170);
                    margin: 30px;
                    text-align: center;
                    font-size: 1.3em;
                }

                .booking-modal-subtitle {
                    color: rgb(100,100,100);
                    text-align: center;
                    text-transform: uppercase;
                    font-size: 1.4em;
                }

                .livestream-speaker-avatar-capsule {
                    border: 2px solid rgb(0, 210, 170);
                    display: inline-block;
                    margin: 0 15px 0 0;
                    padding: 6px;
                    border-radius: 50%;
                }

                .livestream-speaker-avatar {
                    width: 75px;
                    padding-top: 75px;
                    border-radius: 50%;
                    vertical-align: middle;
                    display: inline-block;
                    box-shadow: 0 0 2px grey;
                    display: inline-block;
                    background-size: cover;
                }

                .livestream-streamer-position {
                    margin: 0 0 0 0;
                    font-size: 0.9em;
                    line-height: 1.2em;
                    color: grey;
                    text-align: left;
                }

                .livestream-streamer-degree {
                    font-size: 0.8em;
                    text-align: left;
                }

                .livestream-streamer-name {
                    font-size: 1.3em;
                    font-weight:600;
                    margin-bottom: 5px;
                    text-align: left;
                }

                .livestream-streamer-description {
                    margin: 20px auto;
                    text-align: center;
                }

                .livestream-streamer {
                    margin-left: 5px;
                    display: inline-block;
                    vertical-align: middle;
                    color: rgb(40,40,40);
                }

                .modalStep {
                    padding: 10px 0;
                }

                .talentPoolMessage {
                    vertical-align: middle;
                    margin: 0 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .talentPoolMessage.active {
                    color: rgb(0, 210, 170);
                }
                `}</style>
        </Fragment>
    );
}

export default withFirebase(BookingModal);