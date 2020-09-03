import {useState, useEffect, useRef, Fragment} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Dropdown} from "semantic-ui-react";

import { useRouter } from 'next/router';
import { withFirebasePage } from '../../../context/firebase';
import ViewerHandRaiseComponent from 'components/views/viewer/viewer-hand-raise-component/ViewerHandRaiseComponent';
import ViewerComponent from 'components/views/viewer/viewer-component/ViewerComponent';
import NewCommentContainer from 'components/views/viewer/comment-container/NewCommentContainer';
import UserContext from 'context/user/UserContext';
import MiniChatContainer from 'components/views/streaming/comment-container/categories/chat/MiniChatContainer';

function ViewerPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const { user, userData } = React.useContext(UserContext);

    const [showMenu, setShowMenu] = useState(true);
    const [userIsInTalentPool, setUserIsInTalentPool] = useState(false);
    const [currentLivestream, setCurrentLivestream] = useState(false);

    const [careerCenters, setCareerCenters] = useState([]);
    const [handRaiseActive, setHandRaiseActive] = useState(false);
    const streamerId = 'ehdwqgdewgzqzuedgquzwedgqwzeugdu';

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
        if (currentLivestream) {
            props.firebase.getLivestreamCareerCenters(currentLivestream.universities).then( querySnapshot => {
                let groupList = [];
                querySnapshot.forEach(doc => {
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
        return () => console.log('Viewer destroyed');
    },[]);

    function joinTalentPool() {
        if (!user) {
            return router.replace('/signup');
        }

        props.firebase.joinCompanyTalentPool(currentLivestream.companyId, user.email);
    }

    function leaveTalentPool() {
        if (!user) {
            return router.replace('/signup');
        }

        props.firebase.leaveCompanyTalentPool(currentLivestream.companyId, user.email);
    }

    let logoElements = careerCenters.map( (careerCenter, index) => {
        return (
            <Fragment>
                <Image src={ careerCenter.logoUrl } style={{ maxWidth: '150px', maxHeight: '50px', marginRight: '15px', display: 'inline-block' }}/>
            </Fragment>
        );
    });

    return (
        <div className='topLevelContainer'>
            {/* <div className='top-menu'>
                <div className='top-menu-left'>    
                    <Image src='/logo_teal.png' style={{ maxHeight: '50px', maxWidth: '150px', display: 'inline-block', marginRight: '2px'}}/>
                    { logoElements }
                    <div style={{ position: 'absolute', bottom: '13px', left: '120px', fontSize: '7em', fontWeight: '700', color: 'rgba(0, 210, 170, 0.2)', zIndex: '50'}}>&</div>
                </div>
                <div className={'top-menu-right'}>
                    <Image src={ currentLivestream.companyLogoUrl } style={{ position: 'relative', zIndex: '100', maxHeight: '50px', maxWidth: '150px', display: 'inline-block', margin: '0 10px'}}/>
                    <Button style={{ display: currentLivestream.hasNoTalentPool ? 'none' : 'inline-block' }}size='big' content={ userIsInTalentPool ? 'Leave Talent Pool' : 'Join Talent Pool'} icon={ userIsInTalentPool ? 'delete' : 'handshake outline'} onClick={ userIsInTalentPool ? () => leaveTalentPool() : () => joinTalentPool()} primary={!userIsInTalentPool}/> 
                </div>
            </div> */}
            <div className='black-frame' style={{ left: showMenu ? '280px' : '0'}}>
                { handRaiseActive ? 
                    <ViewerHandRaiseComponent currentLivestream={currentLivestream} handRaiseActive={handRaiseActive} setHandRaiseActive={setHandRaiseActive}/> :
                    <ViewerComponent livestreamId={livestreamId} streamerId={streamerId}  currentLivestream={currentLivestream} handRaiseActive={handRaiseActive} setHandRaiseActive={setHandRaiseActive}/>
                }
            </div>
            <div className='video-menu-left' style={{ width: showMenu ? '280px' : '0'}}>
                <NewCommentContainer showMenu={showMenu} setShowMenu={setShowMenu} streamer={false} livestream={ currentLivestream } handRaiseActive={handRaiseActive} setHandRaiseActive={setHandRaiseActive} localId/>
            </div>
            <div className='mini-chat-container'>
                <MiniChatContainer livestream={ currentLivestream } showMenu={showMenu}/>
            </div>
            <style jsx>{`
                .hidden {
                    display: none
                }

                .topLevelContainer {
                    position: relative;
                    min-height: 100vh;
                }

                .top-menu {
                    background-color: rgba(245,245,245,1);
                    padding: 15px 0;
                    height: 75px;
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

                .remoteVideoContainer {
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translate(-50%);
                    width: 80%;
                    height: 200px;
                }

                .mini-chat-container {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-60%);
                    right: 20px;
                    width: 300px;
                    z-index: 100;
                }

                .black-frame {
                    z-index: 10;
                    background-color: black;
                }

                @media(max-width: 768px) {
                    .black-frame {
                        position: absolute;
                        width: 100%;
                        height: 60vh;
                        top: 0;
                        left: 0;
                        right: 0;
                    }
                }

                @media(min-width: 768px) {
                    .black-frame {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        right: 0;
                        left: 280px;
                    }
                }

                .video-menu-left {
                    z-index: 15;
                }

                @media(max-width: 768px) {
                    .video-menu-left {
                        position: absolute;
                        top: 60vh;
                        left: 0;
                        width: 100%;
                        height: 100vh;
                    }
                }

                @media(min-width: 768px) {
                    .video-menu-left {
                        position: absolute;
                        top: 0;
                        left: 0;
                        bottom: 0;
                        width: 280px;
                    }
                }
            `}</style>
        </div>
    );
}

export default withFirebasePage(ViewerPage);