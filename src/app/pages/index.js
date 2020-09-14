import { Fragment, useEffect, useRef, useState } from "react";
import {Container, Grid, Image, Button, Icon} from "semantic-ui-react";

import { withFirebase } from '../data/firebase/FirebaseContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";

function LandingPage(props) {

    let videoBackground = 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/speaker-video%2Flanding.mp4?alt=media';
    const secondPicture = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Finteract.png?alt=media";

    const [user, setUser] = useState(false);
    const [userData, setUserData] = useState(null);

    const [companies, setCompanies] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [speakerSelected, setSpeakerSelected] = useState(null);
    
    const myRef = useRef(null);
    const topSpeakersRef = useRef(null);
    const bottomSpeakersRef = useRef(null);

    const router = useRouter();

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user && user.emailVerified) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
    },[]);

    useEffect(() => {
        if (user) {
            props.firebase.getUserData(user.email)
                .then(querySnapshot => {
                    let user = querySnapshot.data();
                    if (user) {
                        setUserData(user);
                    }
                    if (!user) {
                        router.replace('/profile');
                    }
                });
        }
    },[user]);

    useEffect(() => {
        props.firebase.getMentors().then( querySnapshot => {
            var mentorsList = [];
            querySnapshot.forEach(doc => {
                let mentor = doc.data();
                mentor.id = doc.id;
                mentorsList.push(mentor);
            });
            setMentors(mentorsList);
        });
    }, []);

    useEffect(() => {
        props.firebase.getCompanies().then( querySnapshot => {
            var companiesList = [];
            querySnapshot.forEach(doc => {
                let company = doc.data();
                company.id = doc.id;
                companiesList.push(company);
            });
            setCompanies(companiesList);
        });
    }, []);

    function scrollToRef(ref) {
        ref.current.scrollIntoView({
            behavior: 'smooth'
        });
    }

    let companyPreviewElements = companies.filter(company => company.rank === 1).map( (company, index) => {
        return (
            <Grid.Column computer='2' mobile='3' key={index}>
                <div className='overviewPreviewLogoContainer'>
                    <div>
                        <Image style={{ maxHeight: '40px', filter: 'brightness(0) invert(0.9)', margin: '0 auto' }} src={company.logoUrl}/>
                    </div>
                    <style jsx>{`
                        .overviewPreviewLogoContainer div {
                            width: 80%;
                            margin: 0 auto;
                            text-align: center;
                            padding: 20px 0;
                        }
                    `}</style>
                </div>
            </Grid.Column>
        );
    })

    let companyElements = companies.map( (company, index) => {
        return (
            <Grid.Column computer='3' tablet='5' mobile='8' key={index}>
                <div className='overviewLogoContainer'>
                    <div>
                        <Image style={{ margin: '0 auto', maxHeight: '40px', filter: 'brightness(0.9)'}} src={company.logoUrl}/>
                    </div>
                    <style jsx>{`
                        .overviewLogoContainer div {
                            width: 70%;
                            margin: 0 auto;
                            text-align: center;
                            padding: 20px 0;
                        }
                    `}</style>
                </div>
            </Grid.Column>
        );
    })

    let introElements = mentors.map((mentor, index) => {
        return (
            <Grid.Column computer={3} tablet={4} mobile={6} key={index}>
                <div className='stepContainer'>
                    <div className='stepImageContainer'>
                        <div className='stepImage circle' style={{ backgroundImage: 'url(' + mentor.imageUrl + ')'}} onClick={() => setSpeakerSelected(mentor)}>
                            <div className='overlay'>
                                <Icon style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontSize: '1.5em', opacity: '0.8'}} name='play'/>
                            </div>
                        </div>        
                    </div>
                    <div className='companyLogoContainer'>
                        <Image className='companyLogo' style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxHeight: '40px'}} src={mentor.companyLogoUrl}/>
                    </div>
                    <style jsx>{`
                        .stepContainer {
                            width: 100%;
                            text-align: center;
                            cursor: pointer;
                            animation-duration: 300ms; 
                            position: relative;   
                        }

                        .stepImage {
                            filter: grayscale(0.5);
                            animation: boxAnimation 2s infinite;
                            -webkit-animation: boxAnimation 2s infinite;
                            overflow: hidden;
                        }

                        .stepImage.circle {
                            width: 110px;
                            padding-top: 110px;
                            border-radius: 50%;
                            vertical-align: middle;
                            box-shadow: 0 0 2px white;
                            background-size: cover;
                            box-shadow: 0 0 2px black;
                            margin: 20px auto 10px auto;
                        }

                        .companyLogoContainer {
                            position: relative;
                            width: 80px;
                            height: 50px;
                            margin: 0 auto;
                        }

                        .overlay {
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            background-color: rgba(0, 210, 170, 0.7);
                            opacity: 0;
                            transiton: opacity 1s;
                        }
                    `}</style>
                </div>
            </Grid.Column>
        );
    })

    function goToRoute(route) {
        router.push(route);
    }

    function goToPastLivestream(livestreamId) {
        router.push(`/past-livestream?id=${livestreamId}`, `/past-livestream/${livestreamId}`);
    }

    return (
        <Fragment>
            <div className='introFullPage'>
                <Header page='landing'/>
                <div className='intro-mask'>
                    <Container>
                        <div className='mainTagline'>
                            <h1>Join live streams.</h1>
                            <h1>Ask questions. Get hired.</h1>
                            <h1></h1>
                            <div className=''>
                                <Link href='/next-livestreams'><a><Button primary size='big'>See Next Events</Button></a></Link>
                            </div>
                        </div>
                        <div  className='previewLogos'>
                            <Grid centered className='middle aligned'>
                                {companyPreviewElements}
                            </Grid>
                            <div onClick={() => scrollToRef(myRef)} style={{ cursor: 'pointer' }}>
                                <div>see all companies</div>
                                <Icon name='angle down' size='big'/>
                            </div>
                        </div>
                    </Container>
                    <video id="landing-video" key={videoBackground} autoPlay muted loop playsInline>
                        <source src={videoBackground} type="video/mp4"/>
                    </video>         
                </div>
            </div>
            <div className='top-icons'>
                <Container>
                    <div className='company-icons-label'>What is CareerFairy?</div>
                    <div className='company-icons-sublabel'>From your laptop or smartphone, meet employees at small & large companies who share your background. Ask any question about them, their job or their employer and get the answer during the livestream!</div>
                    <Image id='meet-companies-image' style={{ width: '80%', maxWidth: '900px', margin: '0 auto 50px auto'}} src={secondPicture}/>
                    <div className='company-icons-sublabel'>Discover their work, see their office, get answers to all your questions and find out how you could join them in the future.</div>
                    <Grid centered textAlign='center'>
                    </Grid>
                </Container>     
            </div>
            <div className='top-icons'>
                <Container>
                    <div className='company-icons-label'>Meet future colleagues, get deep insights into any job.</div>
                    <div className='company-icons-sublabel' ref={topSpeakersRef}>Our career live streams connect you directly with the people you could work with, allowing you to ask your questions at the very source.</div>
                    <Grid centered textAlign='center'>
                        { introElements }
                    </Grid>
                </Container>     
            </div>
            <div className='company-icons' ref={myRef}>
                <Container>
                    <div className='company-icons-label'>Join the world's most influential companies</div>
                    <div className='company-icons-sublabel'>We're proud to partner with some of the best organisations on the planet, giving you access to world-class workplaces.</div>
                    <Grid className='middle aligned' centered textAlign='center' style={{marginBottom: '50px'}}>
                        {companyElements}
                    </Grid>
                    <div>
                        <Link href='/next-livestreams'><a><Button primary size='big'>See Next Events</Button></a></Link>
                    </div>
                </Container>     
            </div>
            <style jsx>{`
                .introFullPage {
                    position: relative;
                    width: 100%;
                    height: 550px;
                    overflow: hidden;
                    box-shadow: 0 0 5px grey;
                    border: 2px solid
                }

                .intro-mask {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 100%;
                    background-color: rgba(10,10,10,0.5);
                }

                .mainTagline {
                    position: absolute;
                    width: 90%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }

                .mainTagline h1 {
                    color: white;
                    font-size: calc(1.5em + 2.5vw);
                    font-weight: 700;
                }

                .mainTagline h3 {
                    color: rgba(255,255,255,0.8);
                    text-transform: uppercase;
                    text-align: left;
                    letter-spacing: 2px;
                    font-size: 1.1em;
                    border: 3px solid rgba(255,255,255,0.8);
                    display: inline-block;
                    padding: 5px 10px;
                    margin-bottom: 40px;
                    text-align: center;
                }

                .previewLogos {
                    width: 100%;
                    position: absolute;
                    bottom: 10px;
                    left: 0;
                    text-align: center;
                    color: white;
                }

                .overviewLogoContainer {
                    width: 100%;
                }

                .overviewLogoContainer div {
                    width: 70%;
                    margin: 0 auto;
                    text-align: center;
                    padding: 20px 0;
                }

                #landing-video {
                    min-width: 100%;
                    min-height: 100%;

                    width: auto;
                    height: auto;

                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%,-50%);
                    z-index: -9999;
                    background-color: black;
                }

                .company-icons {
                    margin: 70px 0;
                    width: 100%;
                    text-align: center;
                }

                .company-icons-label {
                    margin: 50px 0 30px 0;
                    font-size: 1.9em;
                    font-weight: 500;
                    text-align: center;
                    line-height: 1.4em;
                }

                .company-icons-sublabel {
                    width: 60%;
                    margin: 0 auto 70px auto;
                    font-size: 1.1em;
                    line-height: 1.5em;
                    font-weight: 300;
                    text-align: center;
                }

                .noSpeakerSelected {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-transform: uppercase;
                    font-size: 1.2em;
                    font-weight: 700;
                    padding: 30px 0;
                    color: white;
                    width: 100%;
                    text-align: center;
                }

                .noSpeakerSelected span {
                    margin: 0 10px;
                }

                .speakerDetailsWindow {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    z-index: 9999;
                    box-shadow: 0 0 5px grey;
                    background-color: white;
                    padding: 30px 0;
                    margin: 0 auto;
                    background-color: rgb(0, 210, 170);
                }

                .fixedContainer {
                    max-width: 150px;
                    padding: 0;
                }

                .stepImageFixed {
                    width: 100px;
                    height: 100px;
                    max-width: 100%;
                    max-height: 100%;
                    background-size: cover;
                    background-position: center center;
                    border-radius: 50%;
                    margin: 0 auto;
                    box-shadow: 0 0 2px grey;
                }

                .overviewPreviewLogoContainer div {
                    width: 80%;
                    margin: 0 auto;
                    text-align: center;
                    padding: 20px 0;
                }

                .stepMentorDescription {
                    color: white;
                    font-weight: 700;
                    font-size: 1.2em;
                }

                .stepMentorDescription .light {
                    font-weight: 300;
                }

                .hidden {
                    display: none
                }
            `}</style>
            <Footer/>
        </Fragment>
    );
}

LandingPage.getInitialProps = async () => {
}

export default withFirebase(LandingPage);