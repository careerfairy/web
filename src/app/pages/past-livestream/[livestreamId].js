import React, {useState, useEffect} from 'react';
import {Container, Button, Grid, Icon, Header as SemanticHeader} from "semantic-ui-react";

import { withFirebasePage } from '../../context/firebase';
import { useRouter } from 'next/router';
import Header from '../../components/views/header/Header';
import ElementTagList from '../../components/views/common/ElementTagList';
import ReactPlayer from 'react-player';
import JobDescriptions from '../../components/views/job-descriptions/JobDescriptions';
import Footer from '../../components/views/footer/Footer';

import Head from 'next/head';

const PastLivestreamDetail = (props) => {

    const router = useRouter();
    const { livestreamId } = router.query;

    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [currentLivestream, setCurrentLivestream] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [showAllQuestions, setShowAllQuestions] = useState(true);

    useEffect(() => {
        if (livestreamId) { 
            props.firebase.getLegacyScheduledLivestreamById(livestreamId).then(querySnapshot => {
                let livestream = querySnapshot.data();
                livestream.id = querySnapshot.id;
                setCurrentLivestream(livestream);
            });
        }
    }, [livestreamId]);

    useEffect(() => {
        if (currentLivestream) {
            setVideoUrl("https://www.youtube.com/watch?v=" + currentLivestream.youtubeId + "?t=0m1s");
        }
    }, [currentLivestream]);


    useEffect(() => {
        if (livestreamId) {
            props.firebase.getLegacyPastLivestreamQuestions(livestreamId).then(querySnapshot => {
                var questionsList = [];
                querySnapshot.forEach(doc => {
                    let question = doc.data();
                    question.id = doc.id;
                    questionsList.push(question);
                });
                setUpcomingQuestions(questionsList);
            });
        }
    }, [livestreamId]);

    function onProgress(data) {
        if (upcomingQuestions && upcomingQuestions.length > 0 && data.loadedSeconds > 2 && data.playedSeconds < upcomingQuestions[0].timecode) {
            return setCurrentQuestionIndex(-1);
        }
        let correspondingQuestion = upcomingQuestions.find((question, index) => {
            if (index === upcomingQuestions.length - 1) {
                return upcomingQuestions[index].timecode < data.playedSeconds;  
            }
            return upcomingQuestions[index].timecode < data.playedSeconds && upcomingQuestions[index+1].timecode > data.playedSeconds;
        })
        if (correspondingQuestion) {
            return setCurrentQuestionIndex(upcomingQuestions.indexOf(correspondingQuestion));
        }
    }

    function goToQuestion(questionIndex) {
        if (questionIndex === -1) {
            setVideoUrl("https://www.youtube.com/watch?v=" + currentLivestream.youtubeId + "?t=0m1s");
        } else {
            setVideoUrl("https://www.youtube.com/watch?v=" + currentLivestream.youtubeId + "?t=" + Math.floor(upcomingQuestions[questionIndex].timecode/60) + "m" + upcomingQuestions[questionIndex].timecode%60 + "s");
        }
        setIsPlaying(true);
    }

    let questionElements = upcomingQuestions.map((question, index) => {
        return (
            <div className={'individual-question-container ' + (index % 2 === 0 ? 'teal ' : '') + (index === currentQuestionIndex ? 'active' : '')} onClick={() => goToQuestion(index)}>
                <p>{ question.title }</p>
                <style jsx>{`
                    .individual-question-container {
                        position: relative;
                        padding: 5px 10px;
                        cursor: pointer;
                        color: rgb(30,30,30);
                        font-size: 1.1em;
                    }


                    .individual-question-container.teal::after { 
                        content: " ";
                        display: block; 
                        height: 0; 
                        clear: both;
                    }

                    .individual-question-container.active p {
                        background-color: rgba(0, 210, 170, 1);
                    }

                    .individual-question-container.active p {
                        color: white;
                    }

                    .individual-question-container.top {
                        color: white;
                        background-color: rgb(0, 210, 170);
                    }

                    .individual-question-container:hover p {
                        background-color: rgba(0, 210, 170, 0.7);
                        transition-duration: 300ms;
                        color: white;
                    }

                    .individual-question-container.active:hover p {
                        background-color: rgba(0, 210, 170);
                        cursor: auto;
                    }

                    .individual-question-container.teal:hover p {
                        background-color: rgba(0, 210, 170,0.8);
                    }

                    .individual-question-container p {
                        width: 100%;
                        font-size: 1em;
                        border-radius: 10px;
                        padding: 20px;
                        background-color: white;
                        box-shadow: 0 0 5px rgb(160,160,160);

                    }

                    .individual-question-container.teal p {
                        float: right;
                        background-color: rgba(204,235,220,1);
                    }
                `}</style>
            </div>
        );
    });

    return (
        <div>
            <Head>
                <title key="title">CareerFairy | Past Live Stream</title>
            </Head>
            <Header color='teal'/>
            <div className='companies-background'>
                <div className='widthContainer'>
                    <div>
                        <div className='video-questions-container'>
                            <div className='aspectRatioContainer large'>
                                <ReactPlayer className='fullscreenReactPlayer' style={{ position: 'absolute', top: '0', left: '0'}} width='100%' height='100%' controls={true} url={videoUrl} playing={isPlaying} key={videoUrl} onPlay={() => {setIsPlaying(true)}} onProgress={onProgress}/>
                            </div>
                            <div className='questions-box'>
                                <div className={'questions-box-absolute overview ' + (showAllQuestions ? 'hidden' : '')}>
                                    <div className='questions-box-absolute-content'>
                                        <div>{ currentQuestionIndex === -1 ? 'Introduction' : upcomingQuestions[currentQuestionIndex].title }</div>
                                    </div>
                                </div>
                                <div className={'questions-box-absolute ' + (showAllQuestions ? 'animated slideInTop' : 'hidden animated slideOutTop')}>
                                    <div className='questions-box-absolute-buttons top'>
                                        <div className='questions-box-absolute-buttons-label'>
                                            Select a question
                                        </div>
                                    </div>
                                    <div className='questions-container-box' >
                                        { questionElements }
                                    </div>
                                </div>
                            </div> 
                        </div> 
                    </div>
                </div>
                <Container textAlign='center'>
                <div className='positions-label'>Find out about following opportunities at { currentLivestream ? currentLivestream.company : '' }</div>
                <JobDescriptions company={currentLivestream ? currentLivestream : null}/>
                <Grid stackable>
                    <Grid.Row>
                        <Grid.Column width={16} textAlign='left'>
                            <div className='speaker-container'>
                                <SemanticHeader as='h5' textAlign='left' color='grey'>Speaker(s)</SemanticHeader>
                                <Grid className='middle aligned' textAlign='left'>
                                    <Grid.Row>
                                        <Grid.Column width={7}>
                                            <div className='container-label'>
                                                Name
                                            </div>
                                            <div className='container-text'>
                                                { currentLivestream ? currentLivestream.speakerName : '' }
                                            </div>
                                        </Grid.Column>
                                        <Grid.Column width={7}>
                                            <div className='container-label'>
                                                Position
                                            </div>
                                            <div className='container-text'>
                                                { currentLivestream ? currentLivestream.speakerJob : '' }
                                            </div>
                                        </Grid.Column>
                                        <Grid.Column width={2}>
                                            <div className='container-text'>
                                                <a href={'https://www.linkedin.com/' + (currentLivestream ? currentLivestream.linkedinId : '') } target='_blank' rel='noopener noreferrer'><Icon name='linkedin alternate' size='big' color='blue' link/></a>
                                            </div>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </div>
                            <div className='speaker-container'>
                                <SemanticHeader as='h5' textAlign='left' color='grey'>What You Should Know</SemanticHeader>
                                <Grid textAlign='left' columns={1}>
                                    <Grid.Row>
                                        <Grid.Column>
                                            <div className='container-description'>
                                                { currentLivestream ?  currentLivestream.description : '' }
                                            </div>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </div>
                            <div className='speaker-container'>
                                <SemanticHeader as='h5' textAlign='left' color='grey'>Focus Backgrounds</SemanticHeader>
                                <Grid textAlign='left' columns={1}>
                                    <Grid.Row>
                                        <Grid.Column>
                                            <ElementTagList fields={currentLivestream ? currentLivestream.fieldsHiring : []}/>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                </Container>
                <Footer/>
            </div>
            <style jsx>{`
                .widthContainer {
                    width: 100%;
                    background-color: rgba(30,30,30,1);
                }

                .questions-box {
                    position: relative;
                    width: 30%;
                    display: inline-block;
                    margin-bottom: -5px;
                    padding-top: 41%;
                }

                .questions-box-absolute-buttons-label {
                    background-color: white;
                    font-size: 1.3em;
                    font-weight: 600;
                    text-transform: uppercase;
                    text-align: center;
                }

                .questions-box-absolute-content {
                    position: absolute;
                    top: 50%;
                    margin: 0 30px;
                    transform: translateY(-50%);
                    display: inline-block;
                    color: white;
                    font-size: 1.7em;
                    font-weight: 400;
                    line-height: 1.2em;
                }

                .questions-box-absolute-buttons.bottom {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 10px 30px;
                    z-index: 3000;
                }

                .questions-box-absolute-buttons.top {
                    position: absolute;
                    background-color: white;
                    box-shadow: 0 0 10px rgb(220,220,220);
                    color: rgb(170,170,170);
                    top: 0;
                    left: 0;
                    right: 0;
                    padding: 10px 30px;
                    z-index: 3000;
                }

                .questions-box-absolute-content div {
                    margin: 20px 0;
                }

                .questions-container-box {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 100%;
                    padding-top: 40px;
                    overflow: scroll;
                    scroll-behavior: smooth;
                    overflow-x: hidden;
                    background-color: white;
                }

                .aspectRatioContainer {
                    position: relative;
                    margin: 0 auto;
                    display: inline-block;
                    margin-bottom: -5px;
                    padding-top: 41%;
                }

                .aspectRatioContainer.large {
                    width: 70%;
                }

                .aspectRatioContainer.small {
                    padding-top: 20%;
                }

                .fullscreenReactPlayer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                }

                .speaker-container {
                    background-color: white;
                    padding: 20px;
                    border-radius: 5px;
                    margin: 0 0 20px 0;
                    box-shadow: 0 0 10px rgb(220,220,220);
                }

                .container-text {
                    font-size: 1.2em;
                    font-weight: 600;
                }

                .container-description {
                    font-size: 1em;
                    font-weight: 500;
                }

                .positions-label {
                    text-align: left;
                    margin: 20px 0 30px 0;
                    font-weight: 700;
                    color: rgb(180,180,180);
                    font-size: 1.1em;
                    text-transform: uppercase;
                }

                @media(max-width: 991px) {
                    #livestreamTitle {
                        font-size: 1.3em;
                        margin: 20px 0 10px 0;
                    }

                    #livestreamCompanyButtons button {
                        width: 100%;
                    }
                }

                @media(max-width: 600px) {
                    #livestreamTitle {
                        font-size: 1.1em;
                    }
                }

                @media(max-width: 650px) {
                    .jump-to-question-hint{
                        display: none;
                    }

                    .aspectRatioContainer.large {
                        width: 100%;
                        padding-top: 66.25%;
                    }

                    .questions-box {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}

export default withFirebasePage(PastLivestreamDetail);