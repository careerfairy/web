import { Fragment,useEffect, useRef, useState } from "react";
import { Container, Grid, Image, Button, Icon } from "semantic-ui-react";

import Header from "../components/views/header/Header";
import Footer from '../components/views/footer/Footer';

import { useRouter } from 'next/router';
import { withFirebasePage } from "../data/firebase";
import DateUtil from '../util/DateUtil';
import { UNIVERSITY_SUBJECTS } from '../data/StudyFieldData';
import TargetElementList from '../components/views/common/TargetElementList';

import Link from 'next/link';


function ComingUp(props) {

    const backgroundOptions = UNIVERSITY_SUBJECTS;
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [viewDetails, setViewDetails] = useState(true);
    const [allLivestreams, setAllLivestreams] = useState([]);
    const [livestreams, setLivestreams] = useState([]);
    const [fields, setFields] = useState([]);
    const [showAllFields, setShowAllFields] = useState(false);
    const [welcomeSignOpen, setWelcomeSignOpen]= useState(false);
    const [cookieMessageVisible, setCookieMessageVisible] = useState(true);
    const myRef = useRef(null);

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user !== null && user.emailVerified) {
                setUser(user);
            } else {
                setUser(null);
            }
        })
    }, []);

    useEffect(() => {
        if (props.filter) {
            addField(props.filter);
            setShowAllFields(true);
        }
    }, [props.filter]);

    useEffect(() => {
        props.firebase.listenToUpcomingLivestreams( querySnapshot => {
            var livestreams = [];
            querySnapshot.forEach(doc => {
                let livestream = doc.data();
                livestream.id = doc.id;
                livestreams.push(livestream);
            });
            setAllLivestreams(livestreams);
        });
    }, []);

    useEffect(() => {
        if (fields.length === 0) {
            setLivestreams(allLivestreams);
        } else {
            const filteredMentors = allLivestreams.filter(livestream => {
                return fields.some(field => {
                    return livestream.targetGroups.indexOf(field) > -1;
                });
            })
            setLivestreams(filteredMentors);
        }
    }, [allLivestreams, fields]);

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

    function registerToLivestream(livestreamId) {
        if (!user) {
            return router.push('/signup');
        }

        props.firebase.registerToLivestream(livestreamId, user.email);
    }

    function deregisterFromLivestream(livestreamId) {
        if (!user) {
            return router.push('/signup');
        }

        props.firebase.deregisterFromLivestream(livestreamId, user.email);
    }

    function getNumberOfRegistrants(livestream) {
        if (!livestream.registeredUsers) {
            return 0;
        }
        return livestream.registeredUsers.length;
    }

    function userIsRegistered(user, livestream) {
        if (!user || !livestream.registeredUsers) {
            return false;
        }
        return livestream.registeredUsers.indexOf(user.email) > -1;
    }

    function goToUpcomingLivestream(livestreamId) {
        return router.push('/upcoming-livestream/' + livestreamId);
    }

    const filterElement = backgroundOptions.map((option, index) => {
        const nonSelectedStyle = {
            border: '1px solid rgb(44, 66, 81)', 
            color:  'rgb(44, 66, 81)',
        }
        const selectedStyle = {
            border: '1px solid ' +  option.color, 
            color: 'white',
            backgroundColor:  option.color,
            opacity: '1'
        }   
        return(
            <Fragment key={index}>
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

                    .hidden {
                        display: none;
                    }
                `}</style>
            </Fragment>
        );
    })

    const mentorElements = livestreams.map( (mentor, index) => {
        return(
            <Grid.Column key={index} computer={8} tablet={16} mobile={16}>
                <div className='date-indicator'>{ DateUtil.getPrettyDate(mentor.start.toDate()) }</div>
                <div className='companies-mentor-discriber-content'>
                    <div className='livestream-thumbnail' style={{ backgroundImage: 'url(' + mentor.backgroundImageUrl + ')' }}>
                        <div className='livestream-thumbnail-overlay' style={{ border: userIsRegistered(user, mentor) ? '6px solid rgb(0, 210, 170)' : 'none' }}>
                            <div className='livestream-thumbnail-banner top'></div>
                            <div className='livestream-thumbnail-banner bottom'></div>
                            <div className='livestream-thumbnail-overlay-content'> 
                                <Image style={{ maxWidth: '220px', margin: '20px 0'}} src={mentor.companyLogoUrl} />
                                <div className='livestream-position'>{ mentor.title }</div>          
                                <div>
                                    <Button style={{ margin: '0 5px 0 0' }} icon={ (user && mentor.registeredUsers.indexOf(user.email) > -1) ? 'delete' : 'add' } primary={!(user && mentor.registeredUsers.indexOf(user.email) > -1)} content={ (user && mentor.registeredUsers.indexOf(user.email) > -1) ? 'Cancel Booking' : 'Book a spot' } onClick={(user && mentor.registeredUsers.indexOf(user.email) > -1) ? () => deregisterFromLivestream(mentor.id) : () => registerToLivestream(mentor.id)}/>
                                    <Button style={{ margin: '0 5px 0 0' }} icon='signup' content='More Infos' onClick={() => goToUpcomingLivestream(mentor.id)}/>
                                </div>
                                {/* <div className='livestream-entrants'>
                                    <span>{ 60 - mentor.registeredEmails.length }</span> spots left. Register now!
                                </div> */}
                            </div>
                        </div>
                        <div className={'booked-icon ' + (userIsRegistered(user, mentor) ? '' : 'hidden')}>Your spot is booked</div>
                        <div className='coming-icon'><Icon name='rss'/>Livestream</div>
                        {/* <div className='date-icon'><Icon name='calendar outline alternate'/>{ DateUtil.getPrettyDate(mentor.start.toDate()) }</div> */}
                        {/* <div className='spots-left'>
                            <div className='spots-left-number'>{ 60 - getNumberOfRegistrants(mentor) }</div>
                            <div className='spots-left-label'>spots left</div>
                        </div> */}
                    </div>
                    <div className='background'>
                        <Grid centered className='middle aligned' divided>
                            <Grid.Row>
                                <Grid.Column width={14}>
                                    <div className='livestream-streamer-description'>
                                        <div className='livestream-speaker-avatar' style={{ backgroundImage: 'url(' + mentor.mainSpeakerAvatar + ')'}}/>
                                        <div className='livestream-streamer'>
                                            <div className='livestream-streamer-name'>{ mentor.mainSpeakerName }</div>
                                            <div className='livestream-streamer-position'>{ mentor.mainSpeakerPosition }</div>
                                            <div className='livestream-streamer-position'>{ mentor.mainSpeakerBackground }</div>
                                        </div>
                                    </div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        <Grid centered className='middle aligned' >
                            <Grid.Row style={{ paddingTop: 0, paddingBottom: '14px' }}>
                                <Grid.Column width={15}>
                                    <TargetElementList fields={mentor.targetGroups} selectedFields={fields}/>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row style={{ paddingTop: 0, display: 'none' }}>
                                <Grid.Column width={15}>
                                    <div className='university-icon'>
                                        <Image style={{ maxHeight: '10px'}} src={'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Fethz.png?alt=media'}/>
                                    </div>
                                    <div className='university-icon'>
                                        <Image style={{ maxHeight: '10px'}} src={'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Fepfl.png?alt=media'}/>
                                    </div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </div>
                </div>
                <style jsx>{`
                    .hidden {
                        display: none
                    }

                    .date-indicator {
                        text-align: center;
                        margin: 20px;
                        font-size: 1.7em;
                        font-weight: 600;
                        color: rgb(44, 66, 81);
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
                        margin: 0 auto 10px auto;
                        background-size: cover;
                        background-position: center center;
                        box-shadow: 0 0 5px grey;
                        z-index: 100;
                    }

                    .livestream-thumbnail-banner {
                        width: 100%;
                        height: 30px;
                        background-color: black;
                        position: absolute;
                        left:0;
                        z-index: -10;
                    }

                    .livestream-thumbnail-banner.top {
                        top:0;
                    }

                    .livestream-thumbnail-banner.bottom {
                        bottom:0;
                    }

                    .livestream-thumbnail-overlay {
                        cursor: pointer;
                        width: 100%;
                        height: 100%;
                        min-height: 350px;
                        padding: 80px 0 80px 30px;
                        background-color: rgba(255, 255, 255, 1);
                        transition: background-color 0.5s;
                    }

                    .livestream-thumbnail-overlay:hover {
                        background-color: rgba(255, 255, 255, 0.95);
                    }

                    .livestream-thumbnail-overlay-content {
                        position: relative;
                        width: 80%;
                        color: white;
                    }

                    .top-question-label {
                        text-align: left;
                        font-weight: 500;
                        font-size: 0.8em;
                        text-transform: uppercase;
                        color: rgb(180,180,180);
                        margin: 10px 0 0 0;
                    }

                    .top-question-label.white {
                        color: white;
                    }

                    .top-question-label.margined {
                        margin: 10px 0 10px 18px;
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

                    .livestream-industry {
                        text-transform: uppercase;
                    }

                    .livestream-position {
                        font-weight: 500;
                        color: rgb(44, 66, 81);
                        font-size: 1.9em;
                        margin: 10px 0 20px 0;
                        line-height: 1.2em;
                    }

                    .livestream-entrants {
                        margin: 10px 0;
                        font-size: 0.9em;
                        color: white;
                    }

                    .livestream-entrants span {
                        color: rgb(0, 210, 170);
                        font-size: 1.1em;
                        font-weight: 700;
                    }

                    .livestream-speaker-avatar {
                        width: 75px;
                        padding-top: 75px;
                        border-radius: 50%;
                        margin: 0 15px 0 0;
                        vertical-align: middle;
                        display: inline-block;
                        box-shadow: 0 0 2px grey;
                        display: inline-block;
                        background-size: cover;
                    }

                    .date-icon {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        padding: 4px 6px;
                        border: 2px solid rgb(44, 66, 81);
                        text-transform: uppercase;
                        color: rgb(44, 66, 81);
                        font-weight: 700;
                    }

                    .coming-icon {
                        position: absolute;
                        top: 15px;
                        left: 15px;
                        padding: 4px 6px;
                        border: 2px solid rgb(44, 66, 81);
                        text-transform: uppercase;
                        color: rgb(44, 66, 81);
                        font-weight: 700;
                    }

                    .university-icon {
                        max-width: 80px;
                        display: inline-block;
                        margin: 0 10px 0 0;
                        vertical-align: middle;
                    }

                    .booked-icon {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        padding: 10px;
                        color: white;
                        background-color: rgb(0, 210, 170);
                        text-align: center;
                        text-transform: uppercase;
                        font-weight: 700;
                    }

                    .spots-left {
                        position: absolute;
                        right: 20px;
                        bottom: 20px;
                        height: 80px;
                        width: 80px;
                        border-radius: 50%;
                        background-color: white;
                        text-align: center;
                        padding: 20px 0;
                    }

                    .spots-left-number {
                        font-size: 1.8em;
                        font-weight: 700;
                        color: rgb(0, 210, 170);
                    }

                    .spots-left-label {
                        font-size: 0.8em;
                        font-weight: 700;
                        margin: 5px 0;
                        color: rgb(44, 66, 81);
                    }

                    .show-details {
                        position: absolute;
                        width: 100%;
                        bottom: 5px;
                        z-index: 1000;
                        text-align: center;
                    }

                    .background {
                        position: relative;
                        background-color: white;
                        z-index: 10;
                    }
                `}</style>
            </Grid.Column>
        );
    })

    return (
        <div id='landingPageSection'>
            <Header color="white"/>
            <Container className="landingTitleContainer" style={{ paddingBottom: '20px', display: props.university ? 'block' : 'none'}}>
                <Grid className='middle aligned' centered> 
                    <Grid.Column width={6}>
                        <Image src={'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Feth-career-center.png?alt=media'} style={{ margin: '10px 0 10px 0', maxHeight: '110px', filter: 'brightness(0) invert(1)'}}/>
                    </Grid.Column>
                    <Grid.Column width={10}>
                        <div style={{ float: 'right'}}>   
                            <div style={{ fontSize: '1.4em', color: 'white', fontWeight: '700', textAlign: 'right', lineHeight: '1.4em', margin: '5px'}}>Live streams for students of ETH Zurich.</div>
                            <Button style={{ float: 'right'}} content='See all Live Streams' size='mini'/>
                        </div>
                    </Grid.Column>
                </Grid>
            </Container>
            <div className={'filterBar ' + (cookieMessageVisible ? '' : 'hidden')}>
                <Image id='cookie-logo' src='/cookies.png' style={{ display: 'inline-block', margin: '0 20px 0 0', maxHeight: '25px', width: 'auto', verticalAlign: 'top'}}/>
                <p>We use cookies to improve your experience. By continuing to use our website, you agree to our <Link href='/cookies'><a>cookies policy</a></Link> and our <Link href='/privacy'><a>privacy policy</a></Link>.</p>
                <Icon id='cookie-delete' style={{ cursor: 'pointer', verticalAlign: 'top', float: 'right', lineHeight: '30px'}} name='delete' onClick={() => hideCookieMessage()}/>
            </div>
            <div className='mentor-list'>
                <Container>
                    <div id='landingPageButtons'>
                        <div className='landingPageButtonsLabel'>Select your fields of interest</div>
                        { filterElement }
                        <Button style={{ margin: '5px' }} content={showAllFields ? 'Hide all filters' : 'Show all filters'} color='pink' icon={showAllFields ? 'angle up' : 'angle down'} size='mini' onClick={() => setShowAllFields(!showAllFields)}/>
                    </div>
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
                    padding-bottom: 60px;
                }

                #landingPageButtons {
                    text-align: left;
                    margin-bottom: 20px;
                }

                #landingPageButtons button {
                    margin: 0 5px;
                }

                .landingPageButtonsLabel {
                    text-transform: uppercase;
                    font-weight: 600;
                    margin-bottom: 5px;
                    font-size: 0.9em;
                    color: rgb(44, 66, 81);
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
                }import DateUtil from '../util/DateUtil';


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

ComingUp.getInitialProps = ({ query }) => {
    return { university: query.university, filter: query.filter }
}

export default withFirebasePage(ComingUp);