import {Fragment, useState, useEffect} from 'react'
import { Icon, Button, Modal, Header, Step, Grid, Input, Image } from "semantic-ui-react";

import CommonUtil from '../../../util/CommonUtil';
import QuestionVotingBox from '../question-voting-box/QuestionVotingBox';

import Link from 'next/link';

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
        setModalStep(0);
    },[props.modalOpen]);

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


    function performConfirmAction() {
        props.buttonAction();
        setModalOpen(false);
    }

    function addNewQuestion() {
        if (!props.user) {
            return router.replace('/signup');
        }

        if (!newQuestionTitle) {
            return;
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
                setModalStep(3);
            }, () => {
                console.log("Error");
            })
    }

    function joinTalentPool() {
        props.firebase.joinCompanyTalentPool(props.livestream.companyId, props.user.email).then(() => {
            setModalStep(4);
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
                        <div style={{ padding: '200px' }} className={props.registration ? '' : 'hidden'}>
                            <Image src='/loader.gif' style={{ width: '80px', height: 'auto', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} />
                        </div>
                        <div className={props.registration ? 'hidden' : ''} style={{ textAlign: 'center' }}>
                            <Image src={props.livestream.companyLogoUrl} style={{ maxHeight: '120px', maxWidth: '200px', margin: '20px auto'}}/>
                            <div className={ modalStep !== 0 ? 'hidden' : 'modalStep animated fadeIn'}>
                                <h2 className='booking-modal-title'><Icon name='check circle'/>Your spot is secured!</h2>
                                <Button style={{ margin: '10px 2px'}} primary content='Next' onClick={() => setModalStep(1)} size='large'/>
                            </div>
                            <div className={ modalStep !== 1 ? 'hidden' : 'modalStep'}>
                                <h4 className='booking-modal-subtitle'>Which Questions Should The Speaker Answer?</h4>
                                <div style={{ margin: '0 0 50px 0' }}>
                                    <Grid stackable columns={3}>
                                        { questionElements }
                                    </Grid>
                                </div>
                                <Button style={{ margin: '10px 2px'}} primary content='Next' onClick={() => setModalStep(2)} size='large'/>
                            </div>
                            <div className={ modalStep !== 2 ? 'hidden' : 'modalStep animated fadeIn'}>
                                <h4 className='booking-modal-subtitle'>Ask your question. Get the answer during the live stream.</h4>
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
                                <Button style={{ margin: '20px 0 0 0'}} primary content='Submit' onClick={() => addNewQuestion()} size='large'/>
                                <div style={{ margin: '20px 0 10px 0', textAlign: 'center', color: 'rgb(70,70,200)', cursor: 'pointer' }} onClick={() => setModalStep(3)}>Skip</div>
                            </div>
                            <div className={ modalStep !== 3 ? 'hidden' : 'modalStep'}>
                                <h4 className='booking-modal-subtitle'>Join the { props.livestream.company } Talent Pool</h4>
                                <div style={{ margin: '0 0 40px 0'}}>Join { props.livestream.company }'s Talent Pool and be contacted directly in case any relevant opportunity arises for you at { props.livestream.company } in the future. By joining the Talent Pool, you agree that your profile data will be shared with { props.livestream.company }. Don't worry, you can leave a Talent Pool at any time.</div>
                                <Button style={{ margin: '20px 0 0 0'}} content='Join Talent Pool' primary size='large' onClick={() => joinTalentPool()}/>
                                <div style={{ margin: '20px 0 10px 0', textAlign: 'center', color: 'rgb(70,70,200)', cursor: 'pointer' }} onClick={() => setModalStep(4)}>Skip</div>
                            </div>
                            <div className={ modalStep !== 4 ? 'hidden' : 'modalStep animated fadeIn'}>
                                <h2 className='booking-modal-title'><Icon name='check circle'/>Thank you!</h2>
                                <Link href='/next-livestreams'><a><Button style={{ margin: '20px 0 0 0'}} primary fluid content='See all our events' size='large' onClick={() => props.setModalOpen(false)}/></a></Link>
                                <div style={{ margin: '20px 0 10px 0', textAlign: 'center', color: 'rgb(70,70,200)', cursor: 'pointer' }} onClick={() => props.setModalOpen(false)}>Close</div>
                            </div>
                        </div>
                    </Modal.Content>
                </Modal>
                <style jsx>{`
                .hidden {
                    display: none
                }

                .booking-modal-title {
                    color: rgb(0, 210, 170);
                    margin: 30px 0 60px 0;
                    text-align: center;
                    font-size: 1.5em;
                }

                .booking-modal-subtitle {
                    color: rgb(100,100,100);
                    text-align: center;
                    text-transform: uppercase;
                    font-size: 1.2em;
                    margin: 30px 0 10px 0;
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