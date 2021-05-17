import React, {useCallback, useEffect, useState} from 'react';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {withFirebase} from "../../context/firebase";
import {useRouter} from "next/router";
import ViewerTopBar from "./ViewerTopBar";
import {isLoaded} from "react-redux-firebase";
import {useAuth} from "../../HOCs/AuthProvider";
import Loader from "../../components/views/loader/Loader";
import {useMediaQuery} from "@material-ui/core";
import LeftMenu from "../../components/views/viewer/LeftMenu/LeftMenu";
import {v4 as uuidv4} from "uuid";
import {CurrentStreamContext} from "../../context/stream/StreamContext";
import useStreamConnect from "../../components/custom-hook/useStreamConnect";
import PropTypes from "prop-types";
import useStreamRef from "../../components/custom-hook/useStreamRef";
import StreamClosedCountdown from "../../components/views/streaming/sharedComponents/StreamClosedCountdown";

const useStyles = makeStyles((theme) => ({
    root: {
        position: "relative",
        // minHeight: "100vh",
        height: "100vh",
        width: "100%",
        touchAction: "manipulation",
        // border: "6px solid pink",
        backgroundColor: theme.palette.background.dark,
        display: 'flex',
        // height: '100vh',
        overflow: 'hidden',
    },
    wrapper: {
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
        paddingLeft: ({showMenu, mobile}) => (showMenu && !mobile) ? 280 : 0,
        transition: theme.transitions.create("padding-left", {
            duration: theme.transitions.duration.shortest,
            easing: theme.transitions.easing.easeInOut
        }),
        [theme.breakpoints.down("mobile")]: {
            width: "100%",
            paddingTop: 0,
            paddingLeft: 0,
        },
        [theme.breakpoints.up("mobile")]: {
            paddingTop: 55,
        },
    },
    contentContainer: {
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
    },
    content: {
        flex: '1 1 auto',
        height: '100%',
        background: theme.palette.common.black,
        position: "relative"
        // overflow: 'auto'
    },
}));


const ViewerLayout = (props) => {
    const {children, firebase, isBreakout} = props
    const {query: {livestreamId, breakoutRoomId}, replace, asPath} = useRouter()
    const {authenticatedUser, userData} = useAuth();
    const {breakpoints: {values}} = useTheme()
    const mobile = useMediaQuery(`(max-width:${values.mobile}px)`)
    const streamRef = useStreamRef();
    const [audienceDrawerOpen, setAudienceDrawerOpen] = useState(false);
    const [numberOfViewers, setNumberOfViewers] = useState(0);
    const [showVideoButton, setShowVideoButton] = useState({paused: false, muted: false});
    const [play, setPlay] = useState(false);
    const [unmute, setUnmute] = useState(false);

    const [showMenu, setShowMenu] = useState(false);
    const [handRaiseActive, setHandRaiseActive] = useState(false);
    const [streamerId, setStreamerId] = useState(null);
    const classes = useStyles({showMenu, mobile})

    const [selectedState, setSelectedState] = useState("questions");


    const currentLivestream = useStreamConnect()


    const notAuthorized = currentLivestream && !currentLivestream.test && authenticatedUser?.isLoaded && authenticatedUser?.isEmpty

    useEffect(() => {
        if (mobile) {
            setShowMenu(false)
        } else {
            setShowMenu(true);
        }
    }, [mobile]);

    useEffect(() => {
        if (userData?.userEmail) {
            if (livestreamId) {
                firebase.setUserIsParticipating(livestreamId, userData);
            }
            if (breakoutRoomId) {
                firebase.setUserIsParticipatingWithRef(streamRef, userData);
            }

        }
    }, [livestreamId, userData?.email, userData?.linkedinUrl, userData?.firstName, userData?.lastName, breakoutRoomId]);

    useEffect(() => {
        if (currentLivestream && !streamerId) {
            if (currentLivestream.test && authenticatedUser?.email) {
                setStreamerId(currentLivestream.id + authenticatedUser.email)
            } else if (currentLivestream.test) {
                let uuid = uuidv4()
                let joiningId = uuid.replace(/-/g, '')
                setStreamerId(currentLivestream.id + joiningId)
            } else if (authenticatedUser?.email) {
                setStreamerId(currentLivestream.id + authenticatedUser.email)
            }
        }
    }, [currentLivestream?.test, currentLivestream?.id, authenticatedUser?.email])

    if (notAuthorized) {
        replace({
            pathname: `/login`,
            query: {absolutePath: asPath},
        });
    }

    const handleSetNumberOfViewers = useCallback((number) => setNumberOfViewers(number), [])
    const handleStateChange = useCallback((state) => {
        if (!showMenu) {
            setShowMenu(true);
        }
        setSelectedState(state);
    }, [showMenu])

    const showAudience = useCallback(() => {
        setAudienceDrawerOpen(true)
    }, []);

    const hideAudience = useCallback(() => {
        setAudienceDrawerOpen(false)
    }, []);


    const unmuteVideos = useCallback(() => {
        setShowVideoButton(prevState => {
            return {paused: prevState.paused, muted: false}
        });
        setUnmute(true);
    }, [])

    const playVideos = useCallback(() => {
        setShowVideoButton(prevState => {
            return {paused: false, muted: false}
        });
        setPlay(true);
    }, [])

    const toggleShowMenu = useCallback(() => {
        setShowMenu(!showMenu)
    }, [showMenu])

    if (!isLoaded(currentLivestream) || notAuthorized) {
        return <Loader/>
    }


    return (
        <CurrentStreamContext.Provider value={{currentLivestream, isBreakout}}>
            <div className={`${classes.root} notranslate`}>
                <ViewerTopBar
                    showAudience={showAudience}
                    showMenu={showMenu}
                    audienceDrawerOpen={audienceDrawerOpen}
                    numberOfViewers={numberOfViewers}
                    mobile={mobile}
                />
                <LeftMenu
                    handRaiseActive={handRaiseActive}
                    setHandRaiseActive={setHandRaiseActive}
                    streamer={false}
                    handleStateChange={handleStateChange}
                    selectedState={selectedState}
                    setSelectedState={setSelectedState}
                    livestream={currentLivestream}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                    isMobile={mobile}
                    toggleShowMenu={toggleShowMenu}/>

                <div className={classes.wrapper}>
                    <div className={classes.contentContainer}>
                        <div className={classes.content}>
                            {React.cloneElement(children, {
                                playVideos,
                                handRaiseActive,
                                unmuteVideos,
                                showVideoButton,
                                unmute,
                                handleStateChange,
                                selectedState,
                                setSelectedState,
                                play,
                                showMenu,
                                setShowMenu,
                                streamerId,
                                mobile,
                                showAudience,
                                setNumberOfViewers: handleSetNumberOfViewers,
                                hideAudience,
                                audienceDrawerOpen,
                                setShowVideoButton,
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </CurrentStreamContext.Provider>
    );
};

ViewerLayout.propTypes = {
    children: PropTypes.node.isRequired,
    firebase: PropTypes.object
}

export default withFirebase(ViewerLayout);
