import {useState, useEffect, useRef, Fragment} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Dropdown} from "semantic-ui-react";

import { useRouter } from 'next/router';
import { withFirebasePage } from '../../../context/firebase';
import ViewerHandRaiseComponent from 'components/views/viewer/viewer-hand-raise-component/ViewerHandRaiseComponent';
import ViewerComponent from 'components/views/viewer/viewer-component/ViewerComponent';
import NewCommentContainer from 'components/views/viewer/comment-container/NewCommentContainer';
import UserContext from 'context/user/UserContext';
import MiniChatContainer from 'components/views/streaming/comment-container/categories/chat/MiniChatContainer';
import IconsContainer from 'components/views/streaming/icons-container/IconsContainer';
import { useWindowSize } from 'components/custom-hook/useWindowSize';

function ViewerPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [showMenu, setShowMenu] = useState(false);
    const [userIsInTalentPool, setUserIsInTalentPool] = useState(false);
    const [currentLivestream, setCurrentLivestream] = useState(false);
    
    const [careerCenters, setCareerCenters] = useState([]);
    const [handRaiseActive, setHandRaiseActive] = useState(false);
    const [iconsDisabled, setIconsDisabled] = useState(false);
    const [showVideoButton, setShowVideoButton] = useState({ paused: false, muted: false});
    const [unmute, setUnmute] = useState(false);
    const [play, setPlay] = useState(false);

    const streamerId = 'ehdwqgdewgzqzuedgquzwedgqwzeugdu';

    const { authenticatedUser, userData } = React.useContext(UserContext);
    const { width, height } = useWindowSize();

    useEffect(() => {
        if ( width < 768) {
            setShowMenu(false)
        } else {
            setShowMenu(true);
        }
    }, [width]);

    useEffect(() => {
        if (userData && livestreamId) {
            props.firebase.setUserIsParticipating(livestreamId, userData);
        }
    }, [livestreamId, userData]);

    useEffect(() => {
        if (livestreamId) {
            props.firebase.listenToScheduledLivestreamById(livestreamId, querySnapshot => {
                let livestream = querySnapshot.data();
                livestream.id = querySnapshot.id;
                setCurrentLivestream(livestream);
            });
        }
    }, [livestreamId]);

    useEffect(() => {
        if (currentLivestream && currentLivestream.groupIds && currentLivestream.groupIds.length) {
            props.firebase.getDetailLivestreamCareerCenters(currentLivestream.groupIds)
                .then((querySnapshot) => {
                    let groupList = [];
                    querySnapshot.forEach((doc) => {
                        let group = doc.data();
                        group.id = doc.id;
                        groupList.push(group);
                    });
                    setCareerCenters(groupList);
                });
        }
    }, [currentLivestream]);

    useEffect(() => {
        if (userData && currentLivestream && userData.talentPools && userData.talentPools.indexOf(currentLivestream.companyId) > -1) {
            setUserIsInTalentPool(true);
        } else {
            setUserIsInTalentPool(false);
        }
    }, [currentLivestream, userData]);

    useEffect(() => {
        if (iconsDisabled) {
            let timeout = setTimeout(() => {
                setIconsDisabled(false);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [iconsDisabled]);

    function joinTalentPool() {
        if (!authenticatedUser) {
            return router.replace('/signup');
        }

        props.firebase.joinCompanyTalentPool(currentLivestream.companyId, authenticatedUser.email);
    }

    function leaveTalentPool() {
        if (!authenticatedUser) {
            return router.replace('/signup');
        }

        props.firebase.leaveCompanyTalentPool(currentLivestream.companyId, authenticatedUser.email);
    }

    function postIcon(iconName) {
        if (!iconsDisabled) {
            setIconsDisabled(true);
            let email = currentLivestream.test ? 'streamerEmail' : authenticatedUser.email;
            props.firebase.postIcon(currentLivestream.id, iconName, email);
        }  
    }

    function unmuteVideos() {
        setShowVideoButton(prevState => { return { paused: prevState.paused, muted: false }});
        setUnmute(true);
    }

    function playVideos() {
        setShowVideoButton(prevState => { return { paused: false, muted: false }});
        setPlay(true);
    }

    let logoElements = careerCenters.map( (careerCenter, index) => {
        return (
            <Fragment key={index}>
                <Image src={ careerCenter.logoUrl } style={{ maxWidth: '150px', maxHeight: '50px', marginRight: '15px', display: 'inline-block' }}/>
            </Fragment>
        );
    });

    if (currentLivestream && !currentLivestream.test && authenticatedUser === null) {
        router.push('/login');
    }

    return (
        <div className='topLevelContainer'>
            <div className='top-menu'>
                <div className='top-menu-left'>    
                    <Image src='/logo_teal.png' style={{ maxHeight: '50px', maxWidth: '150px', display: 'inline-block', marginRight: '2px'}}/>
                    { logoElements }
                    <div style={{ position: 'absolute', bottom: '13px', left: '120px', fontSize: '7em', fontWeight: '700', color: 'rgba(0, 210, 170, 0.2)', zIndex: '50'}}>&</div>
                </div>
                <div className={'top-menu-right'}>
                    <Image src={ currentLivestream.companyLogoUrl } style={{ position: 'relative', zIndex: '100', maxHeight: '50px', maxWidth: '150px', display: 'inline-block', margin: '0 10px'}}/>
                    <Button style={{ display: currentLivestream.hasNoTalentPool ? 'none' : 'inline-block' }} content={ userIsInTalentPool ? 'Leave Talent Pool' : 'Join Talent Pool'} icon={ userIsInTalentPool ? 'delete' : 'handshake outline'} onClick={ userIsInTalentPool ? () => leaveTalentPool() : () => joinTalentPool()} primary={!userIsInTalentPool}/> 
                </div>
            </div>
            <div className={'black-frame ' + (showMenu ? 'withMenu' : '')}>
                { handRaiseActive ? 
                    <ViewerHandRaiseComponent currentLivestream={currentLivestream} handRaiseActive={handRaiseActive} setHandRaiseActive={setHandRaiseActive}/> :
                    <ViewerComponent livestreamId={livestreamId} streamerId={streamerId}  currentLivestream={currentLivestream} handRaiseActive={handRaiseActive} setHandRaiseActive={setHandRaiseActive} showVideoButton={showVideoButton} setShowVideoButton={setShowVideoButton} unmute={unmute} play={play}/>
                }
                <div className='mini-chat-container'>
                    <MiniChatContainer livestream={ currentLivestream }  isStreamer={false}/>
                </div>
                <div className='action-buttons'>
                    <div className='action-container'>
                        <div className='button action-button red' onClick={() => postIcon('like')}>
                            <Image src='/like.png' disabled={iconsDisabled} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '28px'}}/>
                        </div>
                    </div>
                    <div className='action-container'>
                        <div className='button action-button orange' onClick={() => postIcon('clapping')}>
                            <Image src='/clapping.png' disabled={iconsDisabled} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '28px'}}/>
                        </div>
                    </div>
                    <div className='action-container'>
                        <div className='button action-button yellow' onClick={() => postIcon('heart')}>
                            <Image src='/heart.png' disabled={iconsDisabled} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '28px'}}/>
                        </div>
                    </div>            
                </div>
            </div>
            <div className={'video-menu-left ' + (showMenu ? 'withMenu' : '')}>
                <NewCommentContainer showMenu={showMenu} setShowMenu={setShowMenu} streamer={false} livestream={ currentLivestream } handRaiseActive={handRaiseActive} setHandRaiseActive={setHandRaiseActive} localId/>
            </div>
            <div className='icons-container'>
                <IconsContainer livestreamId={ currentLivestream.id } />
            </div>
            <div className={ 'playButtonContent ' + (showVideoButton.muted ? '' : 'hidden')} onClick={unmuteVideos}>
                <div className='playButton'>
                    <Icon name='volume up' style={{ fontSize: '3rem' }}/>
                    <div>Click to unmute</div>
                </div>     
            </div>
            <div className={ 'playButtonContent ' + (showVideoButton.paused ? '' : 'hidden')} onClick={playVideos}>
                <div className='playButton'>
                    <Icon name='play' style={{ fontSize: '3rem' }}/>
                    <div>Click to play</div>
                </div>     
            </div>
            <style jsx>{`
                .hidden {
                    display: none
                }

                .topLevelContainer {
                    position: relative;
                    min-height: 100vh;
                    height: 100%;
                    width: 100%;
                    touch-action: manipulation;
                }

                .top-menu {
                    background-color: rgba(245,245,245,1);
                    padding: 15px 0;
                    height: 55px;
                    text-align: center;
                    position: relative;
                }

                @media(max-width: 768px) {
                    .top-menu {
                        display: none;
                    }
                }
    
                .top-menu div, .top-menu button {
                    display: inline-block;
                    vertical-align: middle;
                }
    
                .top-menu #stream-button {
                    margin: 0 50px;
                }
    
                .top-menu.active {
                    background-color: rgba(0, 210, 170, 1);
                    color: white;
                }
    
                .top-menu h3 {
                    font-weight: 600;
                }

                .top-menu-left {
                    display: block;
                    position: absolute;
                    top: 50%;
                    left: 20px;
                    transform: translateY(-50%);
                }

                .top-menu-right {
                    position: absolute;
                    top: 50%;
                    right: 20px;
                    transform: translateY(-50%);
                }

                @media(max-width: 768px) {
                    .action-buttons {
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        z-index: 150;
                    }
    
                    .action-button {
                        position: relative;
                        border-radius: 50%;
                        background-color: rgb(0, 210, 170);
                        width: 50px;
                        height: 50px;
                        margin: 15px;
                        cursor: pointer;
                        box-shadow: 0 0 8px rgb(120,120,120);
                    }
                }

                @media(min-width: 768px) {
                    .action-buttons {
                        position: absolute;
                        bottom: 30px;
                        left: 50%;
                        transform: translateX(-50%);
                        z-index: 150;
                    }

                    .action-container {
                        display: inline-block;
                    }
    
                    .action-button {
                        position: relative;
                        border-radius: 50%;
                        background-color: rgb(0, 210, 170);
                        width: 70px;
                        height: 70px;
                        margin: 15px;
                        cursor: pointer;
                        box-shadow: 0 0 8px rgb(120,120,120);
                    }
                }

                .action-button.red {
                    background-color: #e01a4f;
                }
                .button.action-button.red:hover {
                    background-color: #c91847;
                    transition: all ease-in-out 0.2s;
                }
                .button.action-button.red:active {
                    background-color: #a4133a;
                    transition: all ease-in-out 0.2s;
                }

                .action-button.orange {
                    background-color: #f15946;
                }
                .button.action-button.orange:hover {
                    background-color: #ef452e;
                    transition: all ease-in-out 0.2s;
                }
                .button.action-button.orange:active {
                    background-color: #e42a11;
                    transition: all ease-in-out 0.2s;
                }

                .action-button.yellow {
                    background-color: #f9c22e;
                }
                .button.action-button.yellow:hover {
                    background-color: #f8ba12;
                    transition: all ease-in-out 0.2s;
                }
                .button.action-button.yellow:active {
                    background-color: #daa107;
                    transition: all ease-in-out 0.2s;
                }

                .mini-chat-container {
                    position: absolute;
                    bottom: 0;
                    right: 20px;
                    width: 20%;
                    min-width: 250px;
                    z-index: 7250;
                }

                @media(max-width: 768px) {
                    .mini-chat-container{
                        display:none;
                    }
                }

                .icons-container {
                    position: absolute;
                    bottom: 50px;
                    right: 20px;
                    z-index: 100;
                    width: 80px;
                }

                .black-frame {
                    z-index: 10;
                    background-color: black;
                }

                @media(max-width: 768px) {
                    .black-frame {
                        position: absolute;
                        width: 100%;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                    }
                }

                @media(min-width: 768px) {
                    .black-frame {
                        position: absolute;
                        top: 55px;
                        bottom: 0;
                        right: 0;
                        left: 0;
                    }

                    .black-frame.withMenu {
                        position: absolute;
                        top: 55px;
                        bottom: 0;
                        right: 0;
                        left: 280px;
                    }
                }

                @media(max-width: 768px) {
                    .video-menu-left {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 0;
                        bottom 0;
                        z-index: 15;
                    }

                    .video-menu-left.withMenu {
                        width: 100%;
                    }
                }

                @media(min-width: 768px) {
                    .video-menu-left {
                        position: absolute;
                        top: 55px;
                        left: 0;
                        bottom: 0;
                        width: 0;
                        z-index: 15;
                    }

                    .video-menu-left.withMenu {
                        width: 280px;
                    }
                }

                .playButton {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-weight: 500;
                    text-align: center;
                }

                .playButtonContent {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(10,10,10,0.4);
                    cursor: pointer;
                    z-index: 200;
                }
            `}</style>
             <style jsx global>{`
                body {
                    min-height: 100vh;
                    min-height: -webkit-fill-available;
                  }
                  
                  html {
                    height: -webkit-fill-available;
                  }
            `}</style>
        </div>
    );
}

export default withFirebasePage(ViewerPage);