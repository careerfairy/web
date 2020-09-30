import React, {Fragment, useState, useEffect, useRef} from 'react';
import UserUtil from "../../../../data/util/UserUtil";
import axios from "axios";
import DateUtil from "../../../../util/DateUtil";
import {Button, Grid, Icon, Image} from "semantic-ui-react";
import Link from "next/link";
import Skeleton from '@material-ui/lab/Skeleton';
import BookingModal from "../../common/booking-modal/BookingModal";
import {withFirebase} from "context/firebase";
import {makeStyles} from "@material-ui/core/styles";
import {useRouter} from "next/router";
import CopyToClipboard from "./CopyToClipboard";
import LogoElement from "./LogoElement";
import {LazyLoadComponent} from "react-lazy-load-image-component";
import TargetOptions from "../GroupsCarousel/TargetOptions";
import GroupJoinToAttendModal from './GroupJoinToAttendModal';


const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: 5,
        overflow: "hidden",
        paddingBottom: 15,
        textAlign: "left",
        WebkitBoxShadow: ({isHighlighted}) => isHighlighted ? "0px -1px 11px 1px rgba(0,210,170,0.75)" : "0 0 5px rgb(180,180,180)",
        boxShadow: ({isHighlighted}) => isHighlighted ? "0px -1px 11px 1px rgba(0,210,170,0.75)" : "0 0 5px rgb(180,180,180)",
        MozBoxShadow: ({isHighlighted}) => isHighlighted ? "0px -1px 11px 1px rgba(0,210,170,0.75)" : "0 0 5px rgb(180,180,180)",
    }

}));

const AvatarSkeleton = () => (<Skeleton variant="circle" width={40} height={40}/>)

const ThumbnailSkeleton = () => <Skeleton variant="rect" width={210} height={118}/>
const BigThumbnailSkeleton = () => <Skeleton variant="rect" width={600} height={400}/>

export const StreamCardPlaceHolder = () => {
    return (
        <div style={{width: "100%"}}>
            <Skeleton width="100%" variant="text"/>
            <Skeleton variant="circle" width={40} height={40}/>
            <Skeleton variant="rect" width="100%" height={550}/>
        </div>
    )
}


const GroupStreamCard = ({livestream, user, fields, userData, firebase, livestreamId, id, careerCenterId, groupData, listenToUpcoming}) => {

    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false)
    const [careerCenters, setCareerCenters] = useState([])
    const [targetOptions, setTargetOptions] = useState([])
    const [openJoinModal, setOpenJoinModal] = useState(false);
    const classes = useStyles({isHighlighted})

    const router = useRouter();
    const absolutePath = router.asPath

    const linkToStream = listenToUpcoming ? `/next-livestreams?livestreamId=${livestream.id}` : `/next-livestreams?careerCenterId=${groupData.groupId}&livestreamId=${livestream.id}`

    const avatar = livestream.mainSpeakerAvatar ? livestream.mainSpeakerAvatar : 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fplaceholder.png?alt=media';

    useEffect(() => {
        if (checkIfHighlighted() && !isHighlighted) {
            // console.log(`careerCenterId: ${careerCenterId} | groupData.groupId: ${groupData.groupId}`);
            setIsHighlighted(true)
        } else if (checkIfHighlighted() && isHighlighted) {
            setIsHighlighted(false)
        }
    }, [livestreamId, id, careerCenterId, groupData.groupId]);

    useEffect(() => {

        if (groupData.categories && livestream.targetCategories) {
            const {groupId, categories} = groupData
            let totalOptions = []
            categories.forEach(category => totalOptions.push(category.options))
            const flattenedOptions = totalOptions.reduce(function (a, b) {
                return a.concat(b);
            }, []);
            // console.log("flattenedOptions", flattenedOptions);
            const matchedOptions = livestream.targetCategories[groupId]
            // console.log(matchedOptions);
            if (matchedOptions) {
                const filteredOptions = flattenedOptions.filter(option => matchedOptions.includes(option.id))
                // console.log("filteredOptions", filteredOptions);
                setTargetOptions(filteredOptions)
            }
        }
    }, [groupData, livestream])

    useEffect(() => {
        if (livestream && livestream.categories && livestream.categories.length) {
            firebase.getDetailLivestreamCareerCenters(livestream.universities).then(querySnapshot => {
                let groupList = [];
                querySnapshot.forEach(doc => {
                    let group = doc.data();
                    group.id = doc.id;
                    groupList.push(group);
                });
                setCareerCenters(groupList);
            });
        }
    }, [livestream]);

    const checkIfHighlighted = () => {
        if (careerCenterId && livestreamId && id && livestreamId === id && groupData.groupId === careerCenterId) {
            return true
        } else return livestreamId && !careerCenterId && !groupData.id && livestreamId === id;
    }

    function targetHasClickHandler(event) {
        let element = event.target;
        if (element.onclick !== null) {
            return true;
        } else {
            return false;
        }
    }

    function deregisterFromLivestream() {
        if (!user) {
            return router.push({
                pathname: '/login',
                query: {absolutePath}
            });
        }

        firebase.deregisterFromLivestream(livestream.id, user.email);
    }

    function startRegistrationProcess() {
        if (!user) {
            return router.push({
                pathname: '/login',
                query: {absolutePath: linkToStream}
            });
        }

        if (!userData || !UserUtil.userProfileIsComplete(userData)) {
            return router.push({
                pathname: '/profile',
                query: "profile"
            });
        }

        if (!userData?.groupIds?.includes(groupData.groupId)) {
            setOpenJoinModal(true)
        } else {
            firebase.registerToLivestream(livestream.id, user.email).then(() => {
                setBookingModalOpen(true);
                sendEmailRegistrationConfirmation();
            })
        }
    }

    function completeRegistrationProcess() {
        firebase.registerToLivestream(livestream.id, user.email).then(() => {
            debugger;
            setBookingModalOpen(true);
            sendEmailRegistrationConfirmation();
        })
    }

    function handleCloseJoinModal() {
        setOpenJoinModal(false);
    }

    function userIsRegistered() {
        if (!user || !livestream.registeredUsers) {
            return false;
        }
        return livestream.registeredUsers.indexOf(user.email) > -1;
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
                recipientEmail: user.email,
                user_first_name: userData.firstName,
                livestream_date: DateUtil.getPrettyDate(livestream.start.toDate()),
                company_name: livestream.company,
                company_logo_url: livestream.companyLogoUrl,
                livestream_title: livestream.title,
                livestream_link: ('https://careerfairy.io/upcoming-livestream/' + livestream.id)
            }
        });
    }

    const checkIfUserFollows = (careerCenter) => {
        if (user && userData && userData.groupIds) {
            const {groupId} = careerCenter
            return userData.groupIds.includes(groupId)
        } else {
            return false
        }
    }


    let logoElements = careerCenters.map((careerCenter, index) => {
        return (
            <Grid.Column width='8' key={index}>
                <LogoElement livestreamId={livestream.id} userfollows={checkIfUserFollows(careerCenter)}
                             careerCenter={careerCenter} userData={userData} user={user}/>
            </Grid.Column>
        );
    });

    return (
        <LazyLoadComponent
            width="100%"
            style={{width: "100%"}}
            threshold={50}
            placeholder={<StreamCardPlaceHolder/>}>
            <Fragment>
                <div className={classes.root}
                    // onClick={(event) => goToRouteFromParent(event, '/upcoming-livestream/' + livestream.id)}
                >
                    <div className='date-indicator'>
                        {/* <div className='coming-icon-container'>
                        <div className='coming-icon' style={{ color: userIsRegistered() ? 'white' : '', border: userIsRegistered() ? '2px solid white' : ''}} ><Icon name='rss'/>Live stream</div>
                    </div> */}
                        <div>
                            <div style={{display: 'inline-block'}}><Icon name='calendar alternate outline' style={{
                                color: 'rgb(0, 210, 170)',
                                fontSize: '0.7em',
                                marginRight: '10px'
                            }}/>{DateUtil.getPrettyDay(livestream.start.toDate())}</div>
                            <div style={{display: 'inline-block', float: 'right'}}>
                                <Icon name='clock outline'
                                      style={{
                                          color: 'rgb(0, 210, 170)',
                                          fontSize: '0.7em',
                                          marginRight: '10px'
                                      }}/>{DateUtil.getPrettyTime(livestream.start.toDate())}
                            </div>
                        </div>
                    </div>
                    <div className='livestream-thumbnail'
                         style={{backgroundImage: 'url(' + livestream.backgroundImageUrl + ')'}}>
                        <div className='livestream-thumbnail-overlay'
                             style={{backgroundColor: userIsRegistered() ? 'rgba(0, 210, 170, 0.9)' : ''}}>
                            <CopyToClipboard value={linkToStream}/>
                            <div className='livestream-thumbnail-overlay-content'>
                                <Image style={{
                                    maxWidth: '220px',
                                    margin: '30px 0',
                                    maxHeight: '120px',
                                    filter: userIsRegistered() ? 'brightness(0) invert(1)' : ''
                                }} src={livestream.companyLogoUrl}/>
                                <div className='livestream-position'
                                     style={{color: userIsRegistered() ? 'white' : ''}}>{livestream.title}</div>
                                <div>
                                    <Button size='large' style={{margin: '5px 5px 0 0'}}
                                            icon={(user && livestream.registeredUsers?.indexOf(user.email) > -1) ? 'delete' : 'add'}
                                            color={(user && livestream.registeredUsers?.indexOf(user.email) > -1) ? null : 'teal'}
                                            content={user ? ((livestream.registeredUsers?.indexOf(user.email) > -1) ? 'Cancel' : 'I\'ll attend') : 'Register to attend'}
                                            onClick={(user && livestream.registeredUsers?.indexOf(user.email) > -1) ? () => deregisterFromLivestream() : () => startRegistrationProcess()}/>
                                    <Link href={{
                                        pathname: `/upcoming-livestream/${livestream.id}`,
                                        query: listenToUpcoming ? null : {groupId: groupData.groupId}
                                    }}
                                          prefetch={false}><a><Button
                                        size='large' style={{margin: '5px 5px 0 0'}} icon='signup'
                                        content='Details'
                                        color='pink'/></a></Link>
                                </div>
                            </div>
                        </div>
                        <div
                            className={'booked-icon animated tada delay-1s ' + (userIsRegistered() ? '' : 'hidden')}>
                            <Icon
                                name='check circle'/>Booked
                        </div>
                    </div>
                    <div className='background'>
                        <Grid centered className='middle aligned' divided>
                            <Grid.Row>
                                <Grid.Column width={14}>
                                    <div className='livestream-streamer-description'>
                                        <div className='livestream-speaker-avatar-capsule'>
                                            {/*<LazyLoad placeholder={<AvatarSkeleton/>}>*/}
                                            <div className='livestream-speaker-avatar'
                                                 style={{backgroundImage: 'url(' + avatar + ')'}}/>
                                            {/*</LazyLoad>*/}
                                        </div>
                                        <div className='livestream-streamer'>
                                            <div
                                                className='livestream-streamer-name'>{livestream.mainSpeakerName}</div>
                                            <div
                                                className='livestream-streamer-position'>{livestream.mainSpeakerPosition}</div>
                                            <div
                                                className='livestream-streamer-position light'>{livestream.mainSpeakerBackground}</div>
                                        </div>
                                    </div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        <Grid className='middle aligned' centered>
                            <Grid.Row style={{paddingTop: 0, paddingBottom: '5px'}}>
                                <Grid.Column width={15}>
                                    <TargetOptions options={targetOptions}/>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        <div className={careerCenters.length === 0 ? 'hidden' : ''}>
                            <div style={{
                                width: '100%',
                                height: '2px',
                                backgroundColor: 'rgba(0,210,170,0.6)',
                                margin: '30px 0 10px 0'
                            }}/>
                            <div style={{textAlign: 'center', fontSize: '0.8em'}}>created by</div>
                            <Grid className='middle aligned' centered style={{padding: '10px'}}>
                                {logoElements}
                            </Grid>
                        </div>
                    </div>
                </div>
                {/*</Grow>*/}
                <GroupJoinToAttendModal
                    open={openJoinModal}
                    group={groupData}
                    alreadyJoined={false}
                    userData={userData}
                    onConfirm={completeRegistrationProcess}
                    closeModal={handleCloseJoinModal}
                />
                <BookingModal livestream={livestream} modalOpen={bookingModalOpen}
                              setModalOpen={setBookingModalOpen}
                              user={user}/>
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
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    height: 100%;
                    padding: 10px 0 50px 30px;
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
                    left: 0;
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
        </LazyLoadComponent>
    )
        ;
};

export default withFirebase(GroupStreamCard);
