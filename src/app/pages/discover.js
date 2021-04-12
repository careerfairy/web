import { useEffect, useRef, useState } from "react";
import { Container, Grid, Image, Button, Icon } from "semantic-ui-react";

import Header from "../components/views/header/Header";
import { withFirebase } from "context/firebase";
import Footer from '../components/views/footer/Footer';

import Link from 'next/link';
import Head from 'next/head';
import { Avatar } from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import { speakerPlaceholder } from "components/util/constants";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import StreamCardPlaceHolder from "../components/views/NextLivestreams/GroupStreams/groupStreamCard/Spinner";


function LandingPage(props) {

    const [mentors, setMentors] = useState([]);
    const [welcomeSignOpen, setWelcomeSignOpen]= useState(false);
    const[cookieMessageVisible, setCookieMessageVisible] = useState(true);
    const myRef = useRef(null);

    useEffect(() => {
        props.firebase.getPastLivestreams().then( querySnapshot => {
            var mentors = [];
            querySnapshot.forEach(doc => {
                let mentor = doc.data();
                mentor.id = doc.id;
                mentors.push(mentor);
            });
            setMentors(mentors);
        });
    }, []);

    useEffect(() => {
        if (localStorage.getItem('hideCookieMessage') === 'yes') {
            setCookieMessageVisible(false);
        }
    }, []);

    function hideCookieMessage() {
        localStorage.setItem('hideCookieMessage', 'yes');
        setCookieMessageVisible(false);
    }

    const mentorElements = mentors.map( (mentor, index) => {

        let speakerElements = mentor.speakers?.map(speaker => {
            return (<Avatar
                key={speaker.id}
                src={speaker.avatar || speakerPlaceholder}
                alt={speaker.firstName}/>)
        })

        return(
            <LazyLoadComponent style={{width: "50%"}} placeholder={<StreamCardPlaceHolder/>}>
                <Grid.Column key={index} computer={8} tablet={16} mobile={16} className={'companies-mentor-discriber-content-container animated bounceIn'}>
                    <div className='companies-mentor-discriber-content'>
                        <div className='livestream-thumbnail' style={{ backgroundImage: `url(${mentor.backgroundImageUrl}` }}>
                            <div className='livestream-thumbnail-overlay'>
                                <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translateX(-50%) translateY(-50%)', maxHeight: '100%', width: '80%', margin: '0 auto'}}>
                                    <Image style={{ margin: '0 auto', maxHeight: '120px', maxWidth: '270px'}} src={mentor.companyLogoUrl} />
                                    <div className='avatar-container'>
                                        <AvatarGroup max={3}>
                                            {speakerElements}
                                        </AvatarGroup>
                                    </div>        
                                </div>
                            </div>
                        </div>
                        <div className='livestream-title' style={{ backgroundColor: 'rgb(44, 66, 81)', padding: '40px 50px' }}>
                            <div style={{ fontSize: '1.6em', fontWeight: '300', color: 'white'}}>{ mentor.title}</div>
                        </div>
                    </div>
                    <style jsx>{`
                        .companies-mentor-discriber-content {
                            background-color: white;
                            border-radius: 5px;
                            margin: 5px auto;
                            box-shadow: 0 0 5px rgb(180,180,180);
                            text-align: center;
                        }

                        .livestream-thumbnail {
                            position: relative;
                            width: 100%;
                            padding-top: 58.24%;
                            margin: 0 auto;
                            border-radius: 5px;
                            background-size: cover;
                            background-position: center center;
                        }

                        .livestream-thumbnail-banner {
                            width: 100%;
                            height: 30px;
                            background-color: black;
                            position: absolute;
                            left:0;
                        }

                        .livestream-title {
                            border-bottom-left-radius: 5px;
                            border-bottom-right-radius: 5px;
                        }

                        .avatar-container {
                            display: inline-block;
                            margin: 20px 0;
                        }

                        .livestream-thumbnail-overlay {
                            opacity: 1;
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-color: rgba(256,256,256,0.9);
                            border-radius: 5px;
                        }

                        .livestream-thumbnail-overlay:hover {
                            opacity: 1;
                            transition-duration: 300ms;
                        }
                    `}</style>
                </Grid.Column>
            </LazyLoadComponent>
        );
    })

    return (
        <div id='landingPageSection'>
            <Head>
                <title key="title">CareerFairy | Past Live Streams</title>
            </Head>
            <Header color="white"/>
            <div className={'filterBar ' + (cookieMessageVisible ? '' : 'hidden')}>
                <Image id='cookie-logo' src='/cookies.png' style={{ display: 'inline-block', margin: '0 20px 0 0', maxHeight: '25px', width: 'auto', verticalAlign: 'top'}}/>
                <p>We use cookies to improve your experience. By continuing to use our website, you agree to our and our <Link href='/privacy'><a>privacy policy</a></Link>.</p>
                <Icon id='cookie-delete' style={{ cursor: 'pointer', verticalAlign: 'top', float: 'right', lineHeight: '30px'}} name='delete' onClick={() => hideCookieMessage()}/>
            </div>
            <div className='mentor-list'>
                <Container>
                <div className='mentorLabel'>OUR MOST RECENT LIVE STREAMS</div>
                    <Grid stackable>
                        { mentorElements }
                    </Grid>
                </Container>
            </div>
            <div className={'HowItWorksContainer ' + ( welcomeSignOpen ? '' : 'hidden')}>
                <div className='how-it-works' ref={myRef}>
                    <Container>
                            <h3>Welcome to CareerFairy</h3>
                            <Grid columns={3} stackable centered textAlign='center' style={{ marginBottom: '20px'}}>
                                <Grid.Row>
                                    <Grid.Column>
                                        <Image className='stepImage' src='/streamer.png' />
                                        <h2>1. Browse past & future livestreams</h2>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Image className='stepImage' src='/faqs.png' />
                                        <h2>2. Register for future events and ask your questions</h2>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Image className='stepImage' src='/computer.png' />
                                        <h2>3. Get hired by your teammates</h2>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                            <Button primary size='huge' onClick={() => setWelcomeSignOpen(false)}>Got it!</Button>
                    </Container>
                </div>
            </div>
            <Footer/>
            <style jsx>{`
                .hidden {
                    display: none
                }

                #landingPageSection {
                    background-color: rgb(44, 66, 81);
                    min-height: 100%;
                }

                #fp-nav ul li a span {
                    background: rgb(0,210,170);
                }

        

                .howitworks-container:first-child {
                    position: relative;
                    padding: 4% 0 100px 0;
                }

                .HowItWorksContainer {
                    position: fixed;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0,0,0,0.7);
                    z-index: 9999;
                }

                .how-it-works {
                    color: rgb(44, 66, 81);
                    text-align: center;
                    padding: 40px 0;
                    background-color: rgb(245,245,245);
                }

                .how-it-works h3 {
                    font-family: 'Permanent Marker';
                    font-size: 3.1em;
                    margin-bottom: 40px;
                    font-weight: 500;
                    color: rgb(44, 66, 81);
                }

                .how-it-works h2 {
                    font-size: 1.8em;
                    font-weight: 700;
                }

                .how-it-works .describer {
                    font-size: 1.2em;
                }

                .how-it-works h2, .how-it-works h3, .how-it-works div {
                    text-align: center;
                }

                .mentor-list {
                    padding: 30px 0 80px 0;
                    background-color: rgb(230,230,230);
                }

                .mentorLabel {
                    margin-bottom: 10px;
                    font-weight: 700;
                    font-size: 1.3em;
                    color: grey;
                }
                
                .filterBar {
                    color: white;
                    background-color: rgb(0, 210, 170);
                    padding: 20px 20px;
                    font-weight: 500;
                    text-align: left;
                }

                .filterBar p {
                    display: inline-block;
                    margin: 0;
                    max-width: 80%;
                }

                .filterBar p a {
                    text-decoration: underline;
                    cursor: pointer;
                    color: white;
                }
            `}</style>
        </div>
    );
}

export default withFirebase(LandingPage);