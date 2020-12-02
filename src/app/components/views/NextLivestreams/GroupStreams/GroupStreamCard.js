import React, {Fragment, useState, useEffect} from 'react';
import UserUtil from "../../../../data/util/UserUtil";
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
import TargetOptions from "../GroupsCarousel/TargetOptions";
import GroupJoinToAttendModal from './GroupJoinToAttendModal';
import DataAccessUtil from 'util/DataAccessUtil';
import {Avatar, Box, Grid as MuiGrid, Typography} from "@material-ui/core";
import {LazyLoadComponent} from 'react-lazy-load-image-component';


const useStyles = makeStyles((theme) => ({
    root: {
        minWidth: 300,
        borderRadius: 5,
        overflow: "hidden",
        textAlign: "left",
        WebkitBoxShadow: ({isHighlighted}) => isHighlighted ? "0px -1px 11px 1px rgba(0,210,170,0.75)" : "0 0 5px rgb(180,180,180)",
        boxShadow: ({isHighlighted}) => isHighlighted ? "0px -1px 11px 1px rgba(0,210,170,0.75)" : "0 0 5px rgb(180,180,180)",
        MozBoxShadow: ({isHighlighted}) => isHighlighted ? "0px -1px 11px 1px rgba(0,210,170,0.75)" : "0 0 5px rgb(180,180,180)",
    },
    highlightedRoot: {
        minWidth: 300,
        borderRadius: 5,
        border: '20px solid #00d2aa',
        overflow: "hidden",
        paddingBottom: 15,
        textAlign: "left",
        WebkitBoxShadow: ({isHighlighted}) => isHighlighted ? "0px -1px 11px 1px rgba(0,210,170,0.75)" : "0 0 5px rgb(180,180,180)",
        boxShadow: ({isHighlighted}) => isHighlighted ? "0px -1px 11px 1px rgba(0,210,170,0.75)" : "0 0 5px rgb(180,180,180)",
        MozBoxShadow: ({isHighlighted}) => isHighlighted ? "0px -1px 11px 1px rgba(0,210,170,0.75)" : "0 0 5px rgb(180,180,180)",
    },
    speakerAvatar: {
        width: 65,
        height: 65,
    },
    speakerWrapper: {
        display: "flex !important",
        flexDirection: "column !important",
        alignItems: "center !important"
    },
    greenLineBreak: {
        width: '100%',
        height: '2px',
        backgroundColor: 'rgba(0,210,170,0.6)',
    },
    streamerGrid: {
        display: "grid",
        placeItems: "center",
        // padding: theme.spacing(0.5)
    },
    streamerName: {
        fontSize: "1em",
        fontWeight: 600,
        marginBottom: 5,

    },
    streamerPosition: {
        margin: "0 0 0 0",
        fontSize: "0.9em",
        lineHeight: "1.2em",
        color: "grey",
        fontWeight: 300,
        overflowWrap: "break-word",
        wordWrap: "break-word",
        hyphens: "auto",
    },
    streamerPositionLight: {
        margin: "0 0 0 0",
        fontSize: "0.8em",
        lineHeight: "1.2em",
        color: "rgb(180, 180, 180)",
        fontWeight: 300,
        overflowWrap: "break-word",
        wordWrap: "break-word",
        hyphens: "auto",

    },
    speakersWrapper: {
        display: "flex",
        overflowX: "auto",
        width: "100%",
        justifyContent: "center",
        overflowWrap: "break-word",
        wordWrap: "break-word",
        hyphens: "auto",
    },
    speakerDiv: {
        padding: theme.spacing(2),
        minWidth: 100,
        alignItems: "center",
        flexDirection: "column",
        display: "flex",
        flex: 1
    }

}));

export const StreamCardPlaceHolder = () => {
    return (
        <div style={{width: "100%", display: "flex", flexDirection: "column"}}>
            <Skeleton width="100%" variant="text"/>
            <Skeleton variant="circle" width={40} height={40}/>
            <Skeleton variant="rect" width="100%" height={550}/>
        </div>
    )
}


const GroupStreamCard = ({
                             livestream,
                             user,
                             fields,
                             userData,
                             firebase,
                             livestreamId,
                             id,
                             careerCenterId,
                             groupData,
                             listenToUpcoming
                         }) => {
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false)
    const [fetchingCareerCenters, setFetchingCareerCenters] = useState(false)
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
        if (!careerCenters.length && livestream && livestream.groupIds && livestream.groupIds.length) {
            setFetchingCareerCenters(true)
            firebase.getDetailLivestreamCareerCenters(livestream.groupIds)
                .then((querySnapshot) => {
                    let groupList = [];
                    querySnapshot.forEach((doc) => {
                        let group = doc.data();
                        group.id = doc.id;
                        groupList.push(group);
                    });
                    setFetchingCareerCenters(false)
                    setCareerCenters(groupList);
                }).catch(() => setFetchingCareerCenters(false))
        }
    }, [livestream.id]);


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

    const moreThanOneGroup = () => {
        return careerCenters.length > 1
    }

    const onlyOneGroup = () => {
        return careerCenters.length === 1
    }

    const userRegistered = () => {
        if (livestream && livestream.registeredUsers && user) {
            return livestream.registeredUsers.indexOf(user.email) > -1
        } else {
            return false
        }
    }

    const userFollowingAnyGroup = () => {
        if (userData.groupIds && livestream.groupIds) { // are you following any group thats part of this livstream?
            return userData.groupIds.some(id => livestream.groupIds.indexOf(id) >= 0)
        } else {
            return false
        }
    }

    const userFollowingCurrentGroup = () => {
        if (userData.groupIds && groupData.groupId) { // Are you following the group in group tab?
            return userData.groupIds.includes(groupData.groupId)
        } else {
            return false
        }
    }


    function startRegistrationProcess() {
        if (!user || !user.emailVerified) {
            return router.push({
                pathname: `/login`,
                query: {absolutePath: linkToStream},
            });
        }

        if (!userData || !UserUtil.userProfileIsComplete(userData)) {
            return router.push({
                pathname: '/profile',
                query: "profile"
            });
        }
        if (listenToUpcoming) {// If on next livestreams tab...
            if (!userFollowingAnyGroup()) {
                setOpenJoinModal(true)
            } else {
                firebase.registerToLivestream(livestream.id, user.email).then(() => {
                    setBookingModalOpen(true);
                    sendEmailRegistrationConfirmation();
                })
            }
        } else { // if on any other tab that isn't next livestreams...
            if (!userFollowingCurrentGroup()) {
                setOpenJoinModal(true)
            } else {
                firebase.registerToLivestream(livestream.id, user.email).then(() => {
                    setBookingModalOpen(true);
                    sendEmailRegistrationConfirmation();
                })
            }
        }

    }

    function completeRegistrationProcess() {
        firebase.registerToLivestream(livestream.id, user.email).then(() => {
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
        return DataAccessUtil.sendRegistrationConfirmationEmail(user, userData, livestream);
    }

    const checkIfUserFollows = (careerCenter) => {
        if (user && userData && userData.groupIds) {
            const {groupId} = careerCenter
            return userData.groupIds.includes(groupId)
        } else {
            return false
        }
    }

    const getGroups = () => {
        if (groupData.groupId) {
            return [groupData]
        } else {
            return careerCenters
        }
    }

    let speakerElements = livestream.speakers?.map(speaker => {
        return (
            <div key={speaker.id} className={classes.speakerDiv}>
                <Avatar className={classes.speakerAvatar} src={speaker.avatar}/>
                <Typography align="center" className={classes.streamerName}>
                    {`${speaker.firstName} ${speaker.lastName}`}
                </Typography>
                <Typography align="center" className={classes.streamerPosition}>
                    {speaker.position}
                </Typography>
            </div>
        )
    })


    let logoElements = careerCenters.map((careerCenter, index) => {
        return (
            <div style={{flex: 1, minWidth: "50%"}} key={careerCenter.groupId}>
                <LogoElement key={careerCenter.groupId} livestreamId={livestream.id}
                             userfollows={checkIfUserFollows(careerCenter)}
                             careerCenter={careerCenter} userData={userData} user={user}/>
            </div>
        );
    });

    return (
        <LazyLoadComponent style={{width: "100%"}} placeholder={<StreamCardPlaceHolder/>}>
            <Fragment>
                <div className={livestream.highlighted ? classes.highlightedRoot : classes.root}>
                    <div className='date-indicator'>
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
                                <img alt="filter" style={{
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
                        <div className={classes.speakersWrapper}>
                            {speakerElements}
                        </div>
                        {!!targetOptions.length &&
                            <div style={{padding: "1rem", paddingTop: 0}}>
                                    <TargetOptions options={targetOptions}/>
                            </div>}
                        {fetchingCareerCenters ?
                            <>
                                <div className={classes.greenLineBreak}/>
                                <div style={{
                                    display: "flex",
                                    width: "100%",
                                    alignItems: "center",
                                    justifyContent: "space-evenly",
                                    height: 150
                                }}>
                                    <Skeleton style={{borderRadius: 5}} variant="rect" width={120} height={100}/>
                                    <Skeleton style={{borderRadius: 5}} variant="rect" width={120} height={100}/>
                                </div>
                            </>
                            :
                            careerCenters.length ?
                                <div>
                                    <div className={classes.greenLineBreak}/>
                                    <div style={{textAlign: 'center', fontSize: '0.8em', marginTop: 10}}>created by
                                    </div>
                                    <div style={{padding: "1rem", paddingBottom: "1.5rem", display: "flex", justifyContent: "space-evenly", flexWrap: "wrap"}}>
                                        {logoElements}
                                    </div>
                                </div>
                                : null}
                    </div>
                </div>
                <GroupJoinToAttendModal
                    open={openJoinModal}
                    groups={getGroups()}
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
                    background-size: cover;
                    background-position: center center;
                    z-index: 100;
                  }

                  .livestream-thumbnail-banner {
                    width: 100%;
                    height: 30px;
                    background-color: black;
                    position: absolute;
                    left: 0;
                    z-index: -10;
                  }

                  .livestream-thumbnail-banner.top {
                    top: 0;
                  }

                  .livestream-thumbnail-banner.bottom {
                    bottom: 0;
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
                    color: rgb(180, 180, 180);
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
                    color: rgb(180, 180, 180);
                    font-size: 0.8em;
                  }

                  .livestream-streamer-degree {
                    font-size: 0.8em;
                  }

                  .livestream-streamer-name {
                    font-size: 1.3em;
                    font-weight: 600;
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
                    color: rgb(40, 40, 40);
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
                    vertical-align: middle;
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
}


export default withFirebase(GroupStreamCard);
