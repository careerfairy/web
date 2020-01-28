import { Fragment,useEffect, useRef, useState } from "react";
import { Container, Grid, Image, Button, Icon } from "semantic-ui-react";

import Header from "../components/views/header/Header";

import { useRouter } from 'next/router';
import { withFirebase } from "../data/firebase";
import { compose } from "redux";
import Footer from '../components/views/footer/Footer';
import { UNIVERSITY_SUBJECTS } from '../data/StudyFieldData';
import TargetElementList from '../components/views/common/TargetElementList';

import Link from 'next/link';


function LandingPage(props) {

    const backgroundOptions = UNIVERSITY_SUBJECTS;
    const router = useRouter();

    const [allMentors, setAllMentors] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [fields, setFields] = useState([]);
    const [showAllFields, setShowAllFields] = useState(false);
    const [welcomeSignOpen, setWelcomeSignOpen]= useState(false);
    const[cookieMessageVisible, setCookieMessageVisible] = useState(true);
    const myRef = useRef(null);

    useEffect(() => {
        if (props.firebase.isSignInWithEmailLink(window.location.href)) {
            var email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
              email = window.prompt('Please provide your email for confirmation');
            }
            // The client SDK will parse the code from the link for you.
            props.firebase.signInWithEmailLink(email, window.location.href)
              .then(function(result) {
                // Clear email from storage.
                window.localStorage.removeItem('emailForSignIn');
              })
              .catch(function(error) {
              });
          }
    }, []);

    useEffect(() => {
        props.firebase.getPastLivestreams().then( querySnapshot => {
            var mentors = [];
            querySnapshot.forEach(doc => {
                let mentor = doc.data();
                mentor.id = doc.id;
                mentors.push(mentor);
            });
            setAllMentors(mentors);
        });
    }, []);

    useEffect(() => {
        if (fields.length === 0) {
            setMentors(allMentors);
        } else {
            const filteredMentors = allMentors.filter(mentor => {
                return fields.some(field => {
                    return mentor.fieldsHiring.indexOf(field) > -1;
                });
            })
            setMentors(filteredMentors);
        }
    }, [allMentors, fields]);

    useEffect(() => {
        if (localStorage.getItem('hideCookieMessage') === 'yes') {
            setCookieMessageVisible(false);
        }
    }, []);

    function hideCookieMessage() {
        localStorage.setItem('hideCookieMessage', 'yes');
        setCookieMessageVisible(false);
    }

    function addField(field) {
        const fieldsCopy = fields.slice(0);
        fieldsCopy.push(field);
        setFields(fieldsCopy);
    }

    function removeField(field) {
        const fieldsCopy = fields.slice(0);
        fieldsCopy.splice(fieldsCopy.indexOf(field), 1);
        setFields(fieldsCopy);
    }

    function goToPastLivestream(livestreamId) {
        router.push(`/past-livestream?id=${livestreamId}`, `/past-livestream/${livestreamId}`);
    }

    const filterElement = backgroundOptions.map((option, index) => {
        const nonSelectedStyle = {
            border: '1px solid lightgrey', 
            color:  'lightgrey',
        }
        const selectedStyle = {
            border: '1px solid ' +  option.color, 
            color: 'white',
            backgroundColor:  option.color,
            opacity: '1'
        }   
        return(
            <Fragment>
                <div className={'filter-logo-element ' + ( index > 2 && !showAllFields ? 'hidden' : '')} style={ fields.indexOf(option.value) > -1 ? selectedStyle : nonSelectedStyle } onClick={fields.indexOf(option.value) > -1 ? () => removeField(option.value) : () => addField(option.value)}>
                    {option.text}
                </div>
                <style jsx>{`
                    .filter-logo-element {
                        cursor: pointer;
                        display: inline-block;
                        padding: 6px 10px;
                        border-radius: 20px;
                        margin: 4px 8px 4px 0;
                        font-weight: 500;
                        opacity: 0.9;
                        font-size: 0.9em;
                    }

                    .filter-logo-element:hover {
                        background-color: rgb(230,230,230,0.8);
                        transition-duration: 300ms;
                        opacity: 1;
                    }
                `}</style>
            </Fragment>
        );
    })

    const mentorElements = mentors.map( mentor => {
        return(
            <Grid.Column computer={8} tablet={16} mobile={16} className={'companies-mentor-discriber-content-container animated bounceIn'}>
                <div className='companies-mentor-discriber-content'>
                    <div className='livestream-thumbnail' style={{ backgroundImage: 'url("https://img.youtube.com/vi/' + mentor.youtubeId + '/maxresdefault.jpg")'}}>
                        <div className='livestream-thumbnail-banner top'></div>
                        <div className='livestream-thumbnail-banner bottom'></div>
                        <div className='livestream-thumbnail-overlay'>
                            <div className='livestream-thumbnail-overlay-content'> 
                                <div className='top-question-label white'><Icon name='briefcase'/><span>Livestreamed Job offer</span></div>
                                <div className='livestream-position'>{ mentor.jobOffer }</div>          
                                <div>
                                    <Button icon='redo' primary content='Rewatch Livestream' onClick={() => goToPastLivestream(mentor.livestreamId)}/>
                                </div>
                            </div>
                        </div>
                        <div className='relive-icon'>Relive</div>
                    </div>
                    <Grid centered className='middle aligned' divided>
                        <Grid.Row>
                        <Grid.Column width={4}>
                            <div className='companies-mentor-discriber-content-companylogo' onClick={() => goToRoute('/catalog/' + mentor.companyId)}>
                                <Image style={{position: 'absolute', top: '50%', left: '50%', transform: 'translateX(-50%) translateY(-50%)', maxHeight: '100%', maxWidth: '100%', margin: '0 auto'}} src={mentor.companyLogoUrl} />
                            </div>
                        </Grid.Column>
                        <Grid.Column  width={11}>
                            <div className='livestream-streamer-description'>
                                <div className='livestream-speaker-avatar' style={{ backgroundImage: 'url(' + mentor.profileImageUrl + ')'}}/>
                                <div className='livestream-streamer'>
                                    <div className='livestream-streamer-name'>{ mentor.speakerFirstName }</div>
                                    <div className='livestream-streamer-position'>{ mentor.speakerJob }</div>
                                    <div className='livestream-streamer-position'>{ '@ ' + mentor.company }</div>
                                </div>
                            </div>
                        </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column width={15} style={{ paddingTop: 0 }}>
                                <TargetElementList fields={mentor.fieldsHiring} selectedFields={fields}/>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>
                <style jsx>{`
                    .companies-mentor-discriber-content {
                        background-color: white;
                        border-bottom-left-radius: 5px;
                        border-bottom-right-radius: 5px;
                    }

                    .companies-mentor-discriber-content-companylogo {
                        position: relative;
                        height: 70px;
                        width: 100%;
                        margin: 0 auto;
                        text-align: center;
                    }

                    .livestream-thumbnail {
                        position: relative;
                        width: 100%;
                        padding-top: 58.24%;
                        margin: 0 auto 10px auto;
                        border-radius: 5px;
                        background-size: cover;
                        background-position: center center;
                        box-shadow: 0 0 5px grey;
                    }

                    .livestream-thumbnail-banner {
                        width: 100%;
                        height: 30px;
                        background-color: black;
                        position: absolute;
                        left:0;
                    }

                    .livestream-thumbnail-banner.top {
                        top:0;
                        border-radius: 5px 5px 0 0;
                    }

                    .livestream-thumbnail-banner.bottom {
                        bottom:0;
                    }

                    .livestream-thumbnail-overlay {
                        opacity: 1;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0,0,0,0.6);
                        border-radius: 5px;
                    }

                    .livestream-thumbnail-overlay:hover {
                        opacity: 1;
                        transition-duration: 300ms;
                    }

                    .livestream-thumbnail-overlay-content {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 80%;
                        transform: translate(-50%, -50%);
                        color: white;
                    }

                    .top-question-label {
                        text-align: left;
                        font-weight: 500;
                        font-size: 0.8em;
                        text-transform: uppercase;
                        color: grey;
                    }

                    .top-question-label.white {
                        color: white;
                    }

                    .top-question-label span {
                        margin-left: 3px;
                    }

                    .livestream-streamer-position {
                        margin: 0 0 0 0;
                        font-size: 0.9em;
                        line-height: 1.2em;
                        color: grey;
                    }

                    .livestream-streamer-degree {
                        font-size: 0.8em;
                    }

                    .livestream-streamer-name {
                        font-size: 1.3em;
                        font-weight:600;
                        margin-bottom: 5px;
                    }

                    .livestream-streamer-description {
                        margin-top: 5px;
                    }

                    .livestream-streamer {
                        width: 55%;
                        margin-left: 5px;
                        display: inline-block;
                        vertical-align: middle;
                        color: rgb(40,40,40);
                    }

                    .livestream-position {
                        font-weight: 500;
                        color: white;
                        font-size: 2.3em;
                        margin: 10px 0;
                        font-family: 'Permanent Marker';
                        margin: 5px 0 10px 0;
                        line-height: 1.2em;
                    }

                    .livestream-speaker-avatar {
                        width: 75px;
                        padding-top: 75px;
                        border-radius: 50%;
                        margin: 0 5px 0 0;
                        vertical-align: middle;
                        display: inline-block;
                        box-shadow: 0 0 2px white;
                        display: inline-block;
                        background-size: cover;
                    }

                    .relive-icon {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        padding: 4px 6px;
                        border: 2px solid orange;
                        text-transform: uppercase;
                        color: orange;
                        font-weight: 700;
                    }
                `}</style>
            </Grid.Column>
        );
    })

    return (
        <div id='landingPageSection'>
            <Header color="white"/>
            <Container textAlign="center" className="landingTitleContainer">
                <div id='landingPageButtons'>
                    <div className='landingPageButtonsLabel'>Select your fields of interest</div>
                    { filterElement }
                    <Button id='landingFieldSelectorToggle' content={showAllFields ? 'Hide All Fields' : 'Show All Fields'} primary basic icon={showAllFields ? 'angle up' : 'angle down'} size='mini' onClick={() => setShowAllFields(!showAllFields)}/>
                </div>
            </Container>
            <div className={'filterBar ' + (cookieMessageVisible ? '' : 'hidden')}>
                <Image id='cookie-logo' src='/cookies.png' style={{ display: 'inline-block', margin: '0 20px 0 0', maxHeight: '25px', width: 'auto', verticalAlign: 'top'}}/>
                <p>We use cookies to improve your experience. By continuing to use our website, you agree to our <Link href='/cookies'>cookies policy</Link> and our <Link href='/privacy'>privacy policy</Link>.</p>
                <Icon id='cookie-delete' style={{ cursor: 'pointer', verticalAlign: 'top', float: 'right', lineHeight: '30px'}} name='delete' onClick={() => hideCookieMessage()}/>
            </div>
            <div className='mentor-list'>
                <Container>
                    <div className='mentorLabel'>OUR LATEST LIVESTREAMS</div>
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

                #fireLogoLeft {
                    width: 45px;
                    margin-right: 10px;
                    float: left;
                }

                #fireLogoRight {
                    width: 45px;
                    float: right;
                }

                .landingPageTitle {
                    font-size:  3.5em;
                    margin-bottom: 35px;
                    font-weight: 500;
                    padding-right: 25px;
                    line-height: 1em;
                    font-family: 'Permanent Marker'
                }

                .landingPageSubtitle {
                    font-size: 1.2em;
                    margin: 0 auto 30px auto;
                    padding-right: 25px;
                    font-weight: 500;
                    line-height: 1.4em;
                }

                .landingTitleContainer {
                    text-align: center;
                    color: white;
                    margin-top: 0;
                    padding-bottom: 0;
                }

                #landingPageButtons {
                    text-align: left;
                    margin: 25px 0;
                }

                #landingPageButtons button {
                    margin: 0 5px;
                }

                .landingPageButtonsLabel {
                    text-transform: uppercase;
                    font-weight: 600;
                    margin-top: 20px;
                    margin-bottom: 5px;
                    font-size: 0.9em;
                    color: white;
                }

                .landingPageVideoSubtitle {
                    margin: 10px 0 0 0;
                    font-weight: 400;
                }

                .nextEventContainer {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    text-align: left;
                    background-color: rgba(256,256,256,1);
                    color: black;
                    padding: 20px 40px;
                    height: 280px;
                }

                .nextEventLabel {
                    text-transform: uppercase;
                    font-size: 1.4em;
                    margin: 60px 0 30px 0;
                }

                .nextEventTitle {
                    margin-bottom: 20px;
                }

                .nextEventData {
                    margin-top: 40px;
                }

                .overviewData {
                    font-size: 0.9em;
                    background-color: white;
                    padding: 0 0 10% 0;
                    border-radius: 10px;
                    box-shadow: 0 0 1px grey;
                    font-weight: 500;
                    height: 100%;
                }

                .overviewData p {
                    margin: 20px auto 0 auto;
                    width: 60%;
                }

                .overviewData h4 {
                    color: rgb(80,80,80);
                    font-weight: 400;
                    font-size: 1em;
                }

                .overviewCalendarData {
                    background-color: rgb(238, 99, 82);
                    color: white;
                    padding: 15px 0;
                    font-size: 1.4em;
                    border-top-right-radius: 10px;
                    border-top-left-radius: 10px;
                    font-weight: 600;
                    margin-bottom: 20px;
                }

                .overviewCalendarDayData {
                    font-size: 1em;
                }

                .overviewCalendarTimeData {
                    margin-top: 5px;
                    font-size: 0.8em;
                    font-weight: 400;
                }

                .overviewCalendarData span {
                    font-size: 1em;
                    vertical-align: middle;
                    margin-left: 5px;
                }

                .overviewDataImageContainer {
                    position: relative;
                    min-height: 80px;
                    max-width: 50%;
                    margin: 0 auto;
                }

                #overviewDataLogo {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    -ms-transform: translate(-50%, -50%);
                    transform: translate(-50%, -50%);
                    margin: 0 auto;
                    max-width: 100%;
                    max-height: 100px;
                    padding: 10px 0;
                    width: auto;
                    height: auto;
                }

                .overviewData h4.overviewDataTitle {
                    text-align: center;
                    color: rgb(20,20,20);
                    width: 80%;
                    margin: 40px auto;
                    text-transform: uppercase;
                    font-size: 1.4em;
                    font-weight: 600;
                    min-height: 90px;
                }

                .overviewDataSpeakerJobLabel {
                    color: rgb(40,40,40);
                    font-weight: 300;
                }

                #registrationButton {
                    margin-top: 10px;
                    width: 80%;
                    height: 45px;
                }

                .howitworks-container:first-child {
                    position: relative;
                    padding: 4% 0 100px 0;
                }

                #background-image {
                    position: absolute;
                    height: 100%;
                    width: 35%;
                    top: 0;
                    z-index: -9999;
                    background:#fff url('https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/landing%20photos%2Froman.png?alt=media') center center no-repeat;
                    -webkit-background-size: cover;
                    -moz-background-size: cover;
                    -o-background-size: cover;
                    background-size: cover;
                }

                #background-image.right {
                    right: 0;
                }

                #background-image-name {
                    position: absolute;
                    bottom: 20px;
                    font-size: 0.8em;
                    width: 35%;
                }

                #background-image-name.left {
                    left: 20px;
                    text-align: left;
                }

                #background-image-name.right {
                    right: 20px;
                    text-align: right;
                }

                .howitworks-container h1 {
                    color: rgb(0,210,170);
                    font-size: 2.5em;
                    margin-bottom: 50px;
                }

                .howitworks-container p {
                    font-size: 1em;
                }

                #inline-stream-video {
                    padding: 20px;
                    width: 100%;
                    border: 1px solid rgb(240,240,240);
                    margin-top: 30px;
                }

                .inline-stream-chat-container {
                    position: relative;
                    margin-top: 30px;
                    height: 100%;
                }

                .inline-stream-chat-item {
                    background-color: white;
                    padding: 15px 20px;
                    border-radius: 15px;
                    
                    margin-top: 50px;
                    margin-bottom: 15px;
                    font-weight: 600;
                    font-size: 1em;
                    transition: all .6s ease-out;
                    -webkit-transition: all .6s ease-out;
                    opacity: 0;
                }

                .fp-section.active .inline-stream-chat-item {
                    margin-top: 0;
                    opacity: 1;
                }

                .inline-stream-chat-item.item-1 {
                    transition-delay: 1s;
                    -webkit-transition-delay: 1s;
                    color: #F44336;
                    border: 2px solid #F44336;
                }

                .inline-stream-chat-item.item-2 {
                    transition-delay: 2s;
                    -webkit-transition-delay: 2s;
                    color: #FFC107;
                    border: 2px solid #FFC107;
                }

                .inline-stream-chat-item.item-3 {
                    transition-delay: 2s;
                    -webkit-transition-delay: 2s;
                    color: rgb(0,210,170);
                    border: 2px solid rgb(0,210,170);
                }

                .inline-stream-chat-item.item-3 {
                    transition-delay: 3s;
                    -webkit-transition-delay: 3s;
                }

                #typing-icon {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    margin-top: 10px;
                }

                #livestream-link-column {
                    padding: 40px;
                }

                #livestream-link {
                    background-color: rgb(0,210,170);
                    color: white;
                    padding: 20px 30px;
                    border-radius: 5px;
                    font-weight: 500;
                    font-size: 1.2em;
                    margin-top: 300px;
                }

                .margin-top-large {
                    margin-top: 80px;
                }

                .margin-bottom {
                    margin-bottom: 50px;
                }

                .margin-bottom-medium {
                    margin-bottom: 60px;
                }

                .title-secondary {
                    color: rgb(0,210,170);
                    font-size: 3em;
                }

                .companies-list {
                    background-color: white;
                    padding: 10px 0;
                    text-align: center;
                    margin-top: 30px;
                }

                .companies-list h1 {
                    margin: 50px 0;
                    font-size: 2.5em;
                    text-align: center;
                    font-weight: 300;
                }

                .companies-list-image-container {
                    max-width: 60%;
                    margin: 15px auto;
                }

                .companies-list-image-container img {
                    max-height: 60px;
                    margin: 0 auto;
                }

                #companies-list-button {
                    margin-top: 20px;
                }

                .how-to-list {
                    margin-bottom: 120px;
                }

                .how-to-list h1, .next-events h1 {
                    margin-bottom: 60px;
                    font-size: 2.5em;
                    text-align: center;
                    font-weight: 300;
                }

                .overviewDataClassicTitle {
                    margin-top: 0;
                    font-size: 1.2em;
                    color: black;
                    text-shadow: 1px 1px 0 rgb(0,210,170);
                }

                .overviewDataClassicTitle span {
                    color: rgb(40,40,40);
                }

                .overviewDataSpeaker, .overviewDataSpeakerJob {
                    color: black;
                }

                .overviewDataSpeaker {
                    margin-bottom: 0px;
                    font-size: 1.2em;
                    color: rgb(80,80,80);
                    margin-top: 10px;
                }

                .overviewDataIndustry {
                    margin-bottom: 40px;
                    margin-top: 20px;
                    text-transform: uppercase;
                }

                .overviewDataSpeakerJobLabel {
                    font-size: 1.2em;
                    color: black;
                }

                .overviewDataSpeakerJob {
                    font-size: 1.3em;
                    color: rgb(100, 100, 100);
                    font-weight: 500;
                    width: 90%;
                    margin: 0 auto;
                    margin-top: 5px;
                    margin-bottom: 15px;
                }

                .livestreamButtonContainer {
                    margin: 30px 0;
                }

                .stepLabel {
                    color: white;
                    margin-bottom: 0;
                    text-align: center;
                }

                .stepLabel.left, .stepDescription.left {
                    padding-right: 10%;
                }

                .stepLabel.right, .stepDescription.right {
                    padding-left: 10%;
                }

                .stepDescription {
                    color: white;
                    margin: 30px auto 0 auto;
                    font-weight: 400;
                    font-size: 1.4em;
                    text-align: center;
                    width: 90%;
                }

                .stepDescription span {
                    color: rgb(0, 210, 170);
                    font-weight: 600;
                }

                .stepImage {
                    width: 35%;
                    margin: 30px auto;
                }

                .mega-margin {
                    margin-top: 3%;
                }

                .live.videoContainer {
                    margin: 0 auto;
                    position: relative;
                    padding-top: 56.25%;
                }

                .live.videoContainer #featuredVideo {
                    position: absolute;
                    top: 0;
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

                @media(max-width: 768px) {
                    #fp-nav {
                        display: none;
                    }

                    #landingPageButtons {
                        padding: 0;
                    }

                    #landingPageButtons li a {
                        padding: 15px 30px;
                        font-size: 1em;
                        font-weight: 500;
                        color: white;
                        background-color: rgb(0,210,170);
                        transition: all .2s ease-in-out;
                        -webkit-transition: all .2s ease-in-out;
                        border-radius: 5px;
                    }

                    .landingPageTitle {
                        font-size: 2.5em;
                    }

                    .landingPageSubtitle {
                        font-size: 1.1em;
                        margin: 30px 0;
                    }

                    #background-image {
                        display: none;
                    }

                    #background-image-name {
                        display: none;
                    }

                    .howitworks-container {
                    font-size: 0.8em;
                    }

                    .inline-stream-chat-container {
                        margin-top: 0px;
                    }

                    #typing-icon {
                        display: none;
                    }

                    #livestream-link-column {
                        padding: 10px;
                    }

                    .nextEventContainer {
                        display: none;
                    }

                }

                .button-container {
                    margin: 0 auto 20px auto;
                    max-width: 500px;
                }

                .filter-label {
                    margin: 20px 0 0 0;
                    font-weight: 500;
                    font-size: 1.1em;
                }

                .filter-label:first-of-type {
                    margin-top: 40px;
                    margin-bottom: 0px;
                }

                .filter-logo-container {
                    max-width: 150px;
                    max-height: 100px;
                    display: inline-block;
                    margin: 0 40px;
                    vertical-align: middle;
                    padding: 20px;
                    border-radius: 20px;
                }

                .filter-logo-container:hover {
                    transform: scale(1.2);
                    transition-duration: 500ms;
                    cursor: pointer;
                }

                .companies-list-scrollable {
                    overflow-x: scroll;
                    overflow-y: hidden;
                    white-space: nowrap;
                }

                .companies-list-scrollable::-webkit-scrollbar {
                    height: 6px;
                    cursor: pointer;
                }

                .companies-list-scrollable::-webkit-scrollbar-thumb {
                    background: rgb(220,220,220);
                    transition: background-color 0.3s;
                }

                .companies-list-scrollable::-webkit-scrollbar-thumb:hover {
                    background: rgb(0, 210, 170);
                }

                .companies-list-scrollable::-webkit-scrollbar-thumb:active {
                    background: rgb(0, 210, 170);
                }

                .companies-list-scrollable::-webkit-scrollbar-track {
                    background-color: transparent;
                }

                #discover-background-dropdown {
                    position: relative;
                    z-index: 9999;
                    padding: 10px 25px;
                    color: white;
                    background-color: #e13a9d;
                    margin: 5px 5px 20px 5px;
                    border-radius: 30px;
                    font-weight: 500;
                    font-size: 1em;
                }

                #discover-background-dropdown .default.text {
                    color: white;
                }

                #discover-field-dropdown {
                    position: relative;
                    z-index: 9999;
                    padding: 10px 25px;
                    color: white;
                    background-color: #9b45e4;
                    margin: 5px 5px 20px 5px;
                    border-radius: 30px;
                    font-weight: 500;
                    font-size: 1em;
                }

                #discover-field-dropdown .default.text {
                    color: white;
                }

                .mentor-list {
                    padding: 10px 0 80px 0;
                    background-color: rgb(230,230,230);
                }

                .mentorLabel {
                    margin-bottom: 10px;
                    font-weight: 700;
                    font-size: 0.9em;
                    color: grey;
                }

                #discover-company-dropdown {
                    position: relative;
                    z-index: 9999;
                    padding: 10px 25px;
                    color: white;
                    background-color: #fa697c;
                    margin: 5px 5px 20px 5px;
                    border-radius: 30px;
                    font-weight: 500;
                    font-size: 1em;
                }

                #discover-company-dropdown .default.text {
                    color: white;
                }

                #topQuestionSegment {
                    border-radius: 5px 5px 0 0;
                    padding-top: 10px;
                }

                .top-question-container {
                    padding: 0 15px 15px 15px;
                    color: black;
                }

                .top-question {
                    margin-bottom: 15px;
                    font-size: 1.4em;
                    line-height: 1.3em;
                    text-align: left;
                    font-weight: 500;
                    color: white;
                    font-family: 'Rock Salt'
                }

                #topQuestionAnswer{
                    margin: 10px 0;
                }

                #linkedinLink {
                    position: absolute;
                    color: white;
                    top: 10px;
                    right: 5px;
                }

                #followButton {
                    position: absolute;
                    top: 10px;
                    right: 5px;
                }

                .livestream-position {
                    font-weight: 500;
                    color: white;
                    font-size: 2.3em;
                    margin: 10px 0;
                    font-family: 'Permanent Marker';
                    margin: 5px 0 10px 0;
                    line-height: 1.2em;
                }

                .livestream-position-link {
                    text-decoration: underline;
                    font-size: 0.8em;
                }

                #livestream-speaker-avatar {
                    width: 75px;
                    padding-top: 75px;
                    border-radius: 50%;
                    margin: 0 5px 0 0;
                    vertical-align: middle;
                    display: inline-block;
                    box-shadow: 0 0 2px white;
                    display: inline-block;
                    background-size: cover;
                }

                #preview-button {
                    margin: 5px 5px 5px 0;
                }

                .livestream-thumbnail-overlay-question {
                    font-family: 'Roboto Slab';
                    font-size: 1.5em;
                    line-height: 1.1em;
                    margin-bottom: 15px;
                }

                .relive-icon {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    padding: 4px 6px;
                    border: 2px solid orange;
                    text-transform: uppercase;
                    color: orange;
                    font-weight: 700;
                }

                #preview-video-container .content {
                    padding: 0 !important;
                    background-color: transparent !important;
                }

                .preview-video-description {
                    text-align: center;
                    padding: 20px;
                    font-size: 2.5em;
                    background-color: transparent;
                    font-family: 'Roboto Slab'
                }

                @media(max-width: 650px) {
                    .HowItWorksContainer{
                        display: none;
                    }

                    .livestream-position {
                        font-size: 1.5em;
                    }
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