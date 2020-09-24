import { Fragment, useState, useEffect } from 'react';
import { Grid, Image, Button, Icon, Modal, Step, Input, Checkbox } from 'semantic-ui-react';

import { useRouter } from 'next/router';
import { withFirebase } from "context/firebase";
import DateUtil from '../../../util/DateUtil';
import TargetElementList from '../common/TargetElementList';
import BookingModal from '../common/booking-modal/BookingModal';
import axios from 'axios';

import Link from 'next/link';
import UserUtil from 'data/util/UserUtil';


function LivestreamCard(props) {

    const [bookingModalOpen, setBookingModalOpen] = useState(false);

    const router = useRouter();

    const avatar = props.livestream.mainSpeakerAvatar ? props.livestream.mainSpeakerAvatar : 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fplaceholder.png?alt=media';

    function targetHasClickHandler(event) {
        let element = event.target;
        if (element.onclick !== null) {
            return true;
        } else {
            return false;
        }
    }

    function deregisterFromLivestream() {
        if (!props.user) {
            return router.push('/signup');
        }

        props.firebase.deregisterFromLivestream(props.livestream.id, props.user.email);
    }

    function startRegistrationProcess() {
        if (!props.user) {
            return router.push('/signup');
        }

        if (!props.userData || !UserUtil.userProfileIsComplete(props.userData)) {
            return router.push('/profile');
        }

        props.firebase.registerToLivestream(props.livestream.id, props.user.email).then(() => {
            setBookingModalOpen(true);
            sendEmailRegistrationConfirmation();
        })
    }

    function userIsRegistered() {
        if (!props.user || !props.livestream.registeredUsers) {
            return false;
        }
        return props.livestream.registeredUsers.indexOf(props.user.email) > -1;
    }

    function goToRouteFromParent(event, route) {
        if (targetHasClickHandler(event)) {
            return null;
        }
        router.push(route);
    }

    function sendEmailRegistrationConfirmation() {
        return axios({
            method: 'post',
            url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendLivestreamRegistrationConfirmationEmail',
            data: {
                recipientEmail: props.user.email,
                user_first_name: props.userData.firstName,
                livestream_date: DateUtil.getPrettyDate(props.livestream.start.toDate()),
                company_name: props.livestream.company,
                company_logo_url: props.livestream.companyLogoUrl,
                livestream_title: props.livestream.title,
                livestream_link: ('https://careerfairy.io/upcoming-livestream/' + props.livestream.id)
            }
        });
    }

    let logoElements = props.careerCenters.map( (careerCenter, index) => {
        return (
            <Grid.Column width='8' key={index}>
                <Image src={ careerCenter.logoUrl } style={{ maxHeight: '45px', margin: '0 auto' }}/>
            </Grid.Column>
        );
    });
        
    return(
        <Fragment>
            <div className='companies-mentor-discriber-content' onClick={(event) => goToRouteFromParent(event, '/upcoming-livestream/' + props.livestream.id)}>
                <div className='date-indicator'>
                    {/* <div className='coming-icon-container'>
                        <div className='coming-icon' style={{ color: userIsRegistered() ? 'white' : '', border: userIsRegistered() ? '2px solid white' : ''}} ><Icon name='rss'/>Live stream</div>
                    </div> */}
                    <div>
                        <div style={{ display: 'inline-block' }}><Icon name='calendar alternate outline' style={{ color: 'rgb(0, 210, 170)', fontSize: '0.7em', marginRight: '10px' }}/>{ DateUtil.getPrettyDay(props.livestream.start.toDate()) }</div>
                        <div style={{ display: 'inline-block', float: 'right' }}><Icon name='clock outline' style={{ color: 'rgb(0, 210, 170)', fontSize: '0.7em', marginRight: '10px' }}/>{ DateUtil.getPrettyTime(props.livestream.start.toDate()) }</div>
                    </div>
                </div>
                <div className='livestream-thumbnail' style={{ backgroundImage: 'url(' + props.livestream.backgroundImageUrl + ')' }}>
                    <div className='livestream-thumbnail-overlay' style={{ backgroundColor: userIsRegistered() ? 'rgba(0, 210, 170, 0.9)' : ''}}>
                        <div className='livestream-thumbnail-overlay-content'> 
                            <Image style={{ maxWidth: '220px', margin: '30px 0', maxHeight: '120px', filter: userIsRegistered() ? 'brightness(0) invert(1)' : ''}} src={props.livestream.companyLogoUrl} onLoad={() => { props.grid.updateLayout() }}/>
                            <div className='livestream-position' style={{ color: userIsRegistered() ? 'white' : ''}}>{ props.livestream.title }</div>          
                            <div>
                                <Button size='large' style={{ margin: '5px 5px 0 0' }} icon={ (props.user && props.livestream.registeredUsers?.indexOf(props.user.email) > -1) ? 'delete' : 'add' } color={(props.user && props.livestream.registeredUsers?.indexOf(props.user.email) > -1) ? null : 'teal'} content={ props.user ? ((props.livestream.registeredUsers.indexOf(props.user.email) > -1) ? 'Cancel' : 'I\'ll attend') : 'Register to attend'} onClick={(props.user && props.livestream.registeredUsers?.indexOf(props.user.email) > -1) ? () => deregisterFromLivestream() : () => startRegistrationProcess()}/>
                                <Link href={('/upcoming-livestream/' + props.livestream.id)} prefetch={false}><a><Button size='large' style={{ margin: '5px 5px 0 0' }} icon='signup' content='Details' color='pink'/></a></Link>
                            </div>
                        </div>
                    </div>
                    <div className={'booked-icon animated tada delay-1s ' + (userIsRegistered() ? '' : 'hidden')}><Icon name='check circle'/>Booked</div>
                </div>
                <div className='background'>
                    <Grid centered className='middle aligned' divided>
                        <Grid.Row>
                            <Grid.Column width={14}>
                                <div className='livestream-streamer-description'>
                                    <div className='livestream-speaker-avatar-capsule'>
                                        <div className='livestream-speaker-avatar' style={{ backgroundImage: 'url(' + avatar + ')'}}/>
                                    </div>
                                    <div className='livestream-streamer'>
                                        <div className='livestream-streamer-name'>{ props.livestream.mainSpeakerName }</div>
                                        <div className='livestream-streamer-position'>{ props.livestream.mainSpeakerPosition }</div>
                                        <div className='livestream-streamer-position light'>{ props.livestream.mainSpeakerBackground }</div>
                                    </div>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    <Grid className='middle aligned' centered>
                        <Grid.Row style={{ paddingTop: 0, paddingBottom: '5px' }}>
                            <Grid.Column width={15}>
                                <TargetElementList fields={props.livestream.targetGroups} selectedFields={props.fields}/>
                            </Grid.Column>
                        </Grid.Row>   
                    </Grid>
                    <div className={ props.careerCenters.length === 0 ? 'hidden' : ''}>
                        <div style={{ width: '100%', height: '2px', backgroundColor: 'rgba(0,210,170,0.6)', margin: '30px 0 10px 0'}}></div>
                        <div style={{ textAlign: 'center', fontSize: '0.8em'}}>created by</div>
                        <Grid className='middle aligned' centered style={{ padding: '10px' }}>
                            { logoElements }
                        </Grid>
                        </div>
                    </div>
                </div>
            <BookingModal livestream={props.livestream} modalOpen={bookingModalOpen} setModalOpen={setBookingModalOpen} user={props.user}/>
            <style jsx>{`
                .hidden {
                    display: none
                }

                .date-indicator {
                    text-align: left;
                    padding: 30px 45px 30px 45px;
                    font-size: 1.6em;
                    font-weight: 500;
                    color: white;
                    background-color: rgb(44, 66, 81);
                }

                .companies-mentor-discriber-content-companylogo {
                    position: relative;
                    height: 70px;
                    width: 100%;
                    margin: 0 auto;
                    text-align: center;
                }

                .companies-mentor-discriber-content {
                    border-radius: 5px;
                    box-shadow: 0 0 5px rgb(180,180,180);
                    overflow: hidden;
                    padding-bottom: 15px;
                    text-align: left;
                }

                .livestream-thumbnail {
                    position: relative;
                    width: 100%;
                    margin: 0 auto 10px auto;
                    background-size: cover;
                    background-position: center center;
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
                    padding: 50px 0 50px 30px;
                    background-color: rgba(255, 255, 255, 0.90);
                    transition: background-color 0.5s;
                }

                .livestream-thumbnail-overlay:hover {
                    background-color: rgba(255, 255, 255, 0.85);
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
                    font-weight: 300;
                }

                .livestream-streamer-position.light {
                    color: rgb(180,180,180);
                    font-size: 0.8em;
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
                    font-size: 1.6em;
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

                .coming-icon-container {
                    margin: 0 0 30px 0;
                }

                .coming-icon {
                    padding: 6px 8px;
                    border: 3px solid white;
                    text-transform: uppercase;
                    text-align: center;
                    color: white;
                    font-weight: 700;
                    display: inline-block;
                    font-size: 0.8em;
                    margin: 0 auto;
                }

                .university-icon {
                    max-width: 80px;
                    display: inline-block;
                    margin: 0 10px 0 0;
                    vertical-align: middle;
                }

                .booked-icon {
                    position: absolute;
                    top: 0;
                    right: 0;
                    padding: 20px;
                    color: white;
                    text-align: center;
                    font-size: 1.4em;
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

                .modalStep {
                    padding: 30px 0;
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

export default withFirebase(LivestreamCard);