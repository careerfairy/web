import {useState, useEffect, Fragment} from 'react';
import VolumeUpRoundedIcon from '@material-ui/icons/VolumeUpRounded';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import ThumbUpAltOutlinedIcon from '@material-ui/icons/ThumbUpAltOutlined';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import {useRouter} from 'next/router';
import {withFirebasePage} from '../../../context/firebase';
import ViewerHandRaiseComponent from 'components/views/viewer/viewer-hand-raise-component/ViewerHandRaiseComponent';
import ViewerComponent from 'components/views/viewer/viewer-component/ViewerComponent';
import NewCommentContainer from 'components/views/viewer/comment-container/NewCommentContainer';
import UserContext from 'context/user/UserContext';
import MiniChatContainer from 'components/views/streaming/comment-container/categories/chat/MiniChatContainer';
import IconsContainer from 'components/views/streaming/icons-container/IconsContainer';
import {useWindowSize} from 'components/custom-hook/useWindowSize';
import React from 'react';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {Fab, ClickAwayListener, Box, fade} from "@material-ui/core";
import {amber, deepOrange, red} from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
    image: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '28px'
    },
    miniLike: {
        width: "36px !important",
        height: "36px !important",
        backgroundColor: red["A400"],
        color: "white",
        "&:disabled": {
            backgroundColor: fade(red["A400"], 0.5),
            color: "white",
        },
        "&:hover": {
            backgroundColor: red["A700"],
        }
    },
    miniClap: {
        width: "36px !important",
        height: "36px !important",
        backgroundColor: deepOrange[400],
        color: "white",
        "&:disabled": {
            backgroundColor: fade(deepOrange[400], 0.5),
            color: "white",
        },
        "&:hover": {
            backgroundColor: deepOrange[700],
        }
    },
    miniHeart: {
        width: "36px !important",
        height: "36px !important",
        backgroundColor: amber[400],
        color: "white",
        "&:disabled": {
            backgroundColor: fade(amber[400], 0.5),
            color: "white",
        },
        "&:hover": {
            backgroundColor: amber[600],
        }
    },
    miniButtons: {
        "& > *": {
            margin: "0.2rem"
        },
        transition: "transform 0.3s",
        transitionTimingFunction: theme.transitions.easeInOut,
        "@media(min-width: 768px)": {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            transform: "translate(-90px, 0)" // prevent the icons from being overlapped by the chat box when shrunk
        },
        "@media(max-width: 768px)": {
            flexDirection: "column",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }
    },
    cardHovered: {
        "@media(min-width: 768px)": {
            transform: "translate(0, -70px) scale3d(2.4, 2.4, 2.4)",
            "-moz-transform": "translate(0, -70px) scale3d(2.4, 2.4, 2.4)",
            "-o-transform": "translate(0, -70px) scale3d(2.4, 2.4, 2.4)",
            "-webkit-transform": "translate(0, -70px) scale3d(2.4, 2.4, 2.4)",
        },
        "@media(max-width: 768px)": {
            transform: "translate(-50px, 0) scale3d(2.4, 2.4, 2.4)",
            "-moz-transform": "translate(-50px, 0) scale3d(2.4, 2.4, 2.4)",
            "-o-transform": "translate(-50px, 0) scale3d(2.4, 2.4, 2.4)",
            "-webkit-transform": "translate(-50px, 0) scale3d(2.4, 2.4, 2.4)",
        }
    },
    actionArea: {
        "@media(min-width: 768px)": {
            position: "absolute",
            width: "100%",
            bottom: 5,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 150,
            height: 120,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end"
        },
        "@media(max-width: 768px)": {
            position: "absolute",
            right: 15,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 150,
            width: 100,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
        }
    },
    root: {
        position: "relative",
        minHeight: "100vh",
        height: "100%",
        width: "100%",
        touchAction: "manipulation"
    }

}));


function ViewerPage({firebase}) {
    const DELAY = 3000; //3 seconds

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [showMenu, setShowMenu] = useState(false);
    const [userIsInTalentPool, setUserIsInTalentPool] = useState(false);
    const [currentLivestream, setCurrentLivestream] = useState(false);

    const [careerCenters, setCareerCenters] = useState([]);
    const [handRaiseActive, setHandRaiseActive] = useState(false);
    const [iconsDisabled, setIconsDisabled] = useState(false);
    const [showVideoButton, setShowVideoButton] = useState({paused: false, muted: false});
    const [unmute, setUnmute] = useState(false);
    const [play, setPlay] = useState(false);

    const classes = useStyles();
    const [open, setOpen] = React.useState(true);
    const [delayHandler, setDelayHandler] = useState(null)

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleMouseEnter = event => {
        clearTimeout(delayHandler)
        handleOpen()
    }

    const handleMouseLeave = () => {
        setDelayHandler(setTimeout(() => {
            handleClose()
        }, DELAY))
    }

    const handleClap = () => {
        postIcon('clapping')
    }

    const handleLike = () => {
        postIcon('like')
    }
    const handleHeart = () => {
        postIcon('heart')
    }

    const streamerId = 'ehdwqgdewgzqzuedgquzwedgqwzeugdu';

    const {authenticatedUser, userData} = React.useContext(UserContext);
    const {width, height} = useWindowSize();

    useEffect(() => {
        if (width < 768) {
            setShowMenu(false)
        } else {
            setShowMenu(true);
        }
    }, [width]);

    useEffect(() => {
        if (userData && livestreamId) {
            firebase.setUserIsParticipating(livestreamId, userData);
        }
    }, [livestreamId, userData]);

    useEffect(() => {
        if (livestreamId) {
            firebase.listenToScheduledLivestreamById(livestreamId, querySnapshot => {
                let livestream = querySnapshot.data();
                livestream.id = querySnapshot.id;
                setCurrentLivestream(livestream);
            });
        }
    }, [livestreamId]);

    useEffect(() => {
        if (currentLivestream?.groupIds?.length) {
            firebase.getDetailLivestreamCareerCenters(currentLivestream.groupIds)
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
        if ( userData?.talentPools && currentLivestream && userData.talentPools.indexOf(currentLivestream.companyId) > -1) {
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

        firebase.joinCompanyTalentPool(currentLivestream.companyId, authenticatedUser.email);
    }

    function leaveTalentPool() {
        if (!authenticatedUser) {
            return router.replace('/signup');
        }

        firebase.leaveCompanyTalentPool(currentLivestream.companyId, authenticatedUser.email);
    }

    function postIcon(iconName) {
        if (!iconsDisabled) {
            setIconsDisabled(true);
            let email = currentLivestream.test ? 'streamerEmail' : authenticatedUser.email;
            firebase.postIcon(currentLivestream.id, iconName, email);
        }
    }

    function unmuteVideos() {
        setShowVideoButton(prevState => {
            return {paused: prevState.paused, muted: false}
        });
        setUnmute(true);
    }

    function playVideos() {
        setShowVideoButton(prevState => {
            return {paused: false, muted: false}
        });
        setPlay(true);
    }

    let logoElements = careerCenters.map((careerCenter, index) => {
        return (
            <Fragment key={index}>
                <img src={careerCenter.logoUrl}
                       style={{maxWidth: '150px', maxHeight: '50px', marginRight: '15px', display: 'inline-block'}}/>
            </Fragment>
        );
    });

    if (currentLivestream && !currentLivestream.test && authenticatedUser === null) {
        router.push('/login');
    }

    return (
        <div className={classes.root}>
            <div className='top-menu'>
                <div className='top-menu-left'>
                    <img src='/logo_teal.png'
                           style={{maxHeight: '50px', maxWidth: '150px', display: 'inline-block', marginRight: '2px'}}/>
                    {logoElements}
                    <div style={{
                        position: 'absolute',
                        bottom: '13px',
                        left: '120px',
                        fontSize: '7em',
                        fontWeight: '700',
                        color: 'rgba(0, 210, 170, 0.2)',
                        zIndex: '50'
                    }}>&
                    </div>
                </div>
                <div className={'top-menu-right'}>
                    <img src={currentLivestream.companyLogoUrl} style={{
                        position: 'relative',
                        zIndex: '100',
                        maxHeight: '50px',
                        maxWidth: '150px',
                        display: 'inline-block',
                        margin: '0 10px'
                    }}/>
                    {!currentLivestream.hasNoTalentPool ?
                    <Button
                        children={userIsInTalentPool ? 'Leave Talent Pool' : 'Join Talent Pool'}
                        variant="contained"
                        icon={userIsInTalentPool ? 'delete' : 'handshake outline'}
                        onClick={userIsInTalentPool ? () => leaveTalentPool() : () => joinTalentPool()}
                        color={userIsInTalentPool ? "default" : "primary"}/>: null}
                </div>
            </div>
            <div className={'black-frame ' + (showMenu ? 'withMenu' : '')}>
                {handRaiseActive ?
                    <ViewerHandRaiseComponent currentLivestream={currentLivestream} handRaiseActive={handRaiseActive}
                                              setHandRaiseActive={setHandRaiseActive}/> :
                    <ViewerComponent livestreamId={livestreamId} streamerId={streamerId}
                                     currentLivestream={currentLivestream} handRaiseActive={handRaiseActive}
                                     setHandRaiseActive={setHandRaiseActive} showVideoButton={showVideoButton}
                                     setShowVideoButton={setShowVideoButton} unmute={unmute} play={play}/>
                }
                <div className='mini-chat-container'>
                    <MiniChatContainer livestream={currentLivestream} isStreamer={false}/>
                </div>
                <ClickAwayListener onClickAway={handleClose}>
                    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={classes.actionArea}>
                        <Box className={classes.miniButtons} classes={{root: open ? classes.cardHovered : ""}}>
                            <Fab onClick={handleLike} disabled={iconsDisabled} className={classes.miniLike}
                                 aria-label="like">
                                <ThumbUpAltOutlinedIcon fontSize="inherit"/>
                            </Fab>
                            <Fab onClick={handleClap} disabled={iconsDisabled} className={classes.miniClap}
                                 aria-label="clap">
                                <img alt="clap button" style={{width: 15}} src='/clapping.png'
                                     className={classes.image}/>
                            </Fab>
                            <Fab onClick={handleHeart} disabled={iconsDisabled} className={classes.miniHeart}
                                 aria-label="heart">
                                <FavoriteBorderOutlinedIcon fontSize="inherit"/>
                            </Fab>
                        </Box>
                    </div>
                </ClickAwayListener>
            </div>
            <div className={'video-menu-left ' + (showMenu ? 'withMenu' : '')}>
                <NewCommentContainer showMenu={showMenu} setShowMenu={setShowMenu} streamer={false}
                                     livestream={currentLivestream} handRaiseActive={handRaiseActive}
                                     setHandRaiseActive={setHandRaiseActive} localId/>
            </div>
            <div className='icons-container'>
                <IconsContainer livestreamId={currentLivestream.id}/>
            </div>
            <div className={'playButtonContent ' + (showVideoButton.muted ? '' : 'hidden')} onClick={unmuteVideos}>
                <div className='playButton'>
                    <VolumeUpRoundedIcon style={{fontSize: '3rem'}}/>
                    <div>Click to unmute</div>
                </div>
            </div>
            <div className={'playButtonContent ' + (showVideoButton.paused ? '' : 'hidden')} onClick={playVideos}>
                <div className='playButton'>
                    <PlayArrowRoundedIcon style={{fontSize: '3rem'}}/>
                    <div>Click to play</div>
                </div>
            </div>
            <style jsx>{`
                .hidden {
                    display: none
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
                    display: flex !important;
                    align-items: center;
                    top: 50%;
                    right: 20px;
                    transform: translateY(-50%);
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