import { Fragment } from 'react';
import { Grid, Image, Button, Icon } from "semantic-ui-react";

import { useRouter } from 'next/router';
import { withFirebasePage } from "../../../data/firebase";
import DateUtil from '../../../util/DateUtil';
import TargetElementList from '../common/TargetElementList'

import Link from 'next/link';


function LivestreamCard(props) {

    const router = useRouter();

    const avatar = props.livestream.mainSpeakerAvatar ? props.livestream.mainSpeakerAvatar : 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fplaceholder.png?alt=media';

    function registerToLivestream() {
        if (!props.user) {
            return router.push('/signup');
        }

        props.firebase.registerToLivestream(props.livestream.id, props.user.email);
    }

    function deregisterFromLivestream() {
        if (!props.user) {
            return router.push('/signup');
        }

        props.firebase.deregisterFromLivestream(props.livestream.id, props.user.email);
    }

    function getNumberOfRegistrants() {
        if (!props.livestream.registeredUsers) {
            return 0;
        }
        return props.livestream.registeredUsers.length;
    }

    function userIsRegistered() {
        if (!props.user || !props.livestream.registeredUsers) {
            return false;
        }
        return props.livestream.registeredUsers.indexOf(props.user.email) > -1;
    }
        
    return(
        <Fragment>
            <div className='date-indicator'>{ DateUtil.getPrettyDate(props.livestream.start.toDate()) }</div>
            <div className='companies-mentor-discriber-content'>
                <div className='livestream-thumbnail' style={{ backgroundImage: 'url(' + props.livestream.backgroundImageUrl + ')' }}>
                    <div className='livestream-thumbnail-overlay' style={{ backgroundColor: userIsRegistered() ? 'rgba(0, 210, 170, 0.90)' : ''}}>
                        <div className='livestream-thumbnail-overlay-content'> 
                            <Image style={{ maxWidth: '200px', margin: '20px 0', maxHeight: '120px', filter: userIsRegistered() ? 'brightness(0) invert(1)' : ''}} src={props.livestream.companyLogoUrl} onLoad={() => { props.grid.updateLayout() }}/>
                            <div className='livestream-position' style={{ color: userIsRegistered() ? 'white' : ''}}>{ props.livestream.title }</div>          
                            <div>
                                <Button size='large' style={{ margin: '5px 5px 0 0' }} icon={ (props.user && props.livestream.registeredUsers?.indexOf(props.user.email) > -1) ? 'delete' : 'add' } color={(props.user && props.livestream.registeredUsers?.indexOf(props.user.email) > -1) ? 'red' : 'teal'} content={ (props.user && props.livestream.registeredUsers?.indexOf(props.user.email) > -1) ? 'Cancel' : 'Book a spot' } onClick={(props.user && props.livestream.registeredUsers?.indexOf(props.user.email) > -1) ? () => deregisterFromLivestream() : () => registerToLivestream()}/>
                                <Link href={'/upcoming-livestream/' + props.livestream.id}><a><Button size='large' style={{ margin: '5px 5px 0 0' }} icon='signup' content='More Infos'/></a></Link>
                            </div>
                        </div>
                    </div>
                    <div className={'booked-icon animated tada delay-1s ' + (userIsRegistered() ? '' : 'hidden')}><Icon name='check circle'/>Booked</div>
                    <div className='coming-icon' style={{ color: userIsRegistered() ? 'white' : '', border: userIsRegistered() ? '2px solid white' : ''}} ><Icon name='rss'/>Livestream</div>
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
                                        <div className='livestream-streamer-position'>{ props.livestream.mainSpeakerBackground }</div>
                                    </div>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    <Grid centered className='middle aligned' >
                        <Grid.Row style={{ paddingTop: 0, paddingBottom: '14px' }}>
                            <Grid.Column width={15}>
                                <TargetElementList fields={props.livestream.targetGroups} selectedFields={props.fields}/>
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
                    filter: drop-shadow(2px 2px 0 white);
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
                    margin: 10px;
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
                    min-height: 350px;
                    padding: 80px 0 80px 30px;
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
            `}</style>
        </Fragment>
    );
}

export default withFirebasePage(LivestreamCard);