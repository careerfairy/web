import React, {useCallback, useEffect, useState} from 'react';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {withFirebase} from "../../context/firebase";
import {useRouter} from "next/router";
import ViewerTopBar from "./ViewerTopBar";
import {isLoaded, populate, useFirestoreConnect} from "react-redux-firebase";
import {useDispatch, useSelector} from "react-redux";
import {useAuth} from "../../HOCs/AuthProvider";
import Loader from "../../components/views/loader/Loader";
import {useMediaQuery} from "@material-ui/core";
import LeftMenu from "../../components/views/viewer/LeftMenu/LeftMenu";
import {v4 as uuidv4} from "uuid";

import * as actions from "../../store/actions";
import {CurrentStreamContext} from "../../context/stream/StreamContext";

const useStyles = makeStyles((theme) => ({
    wrapper: {
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
        paddingTop: 55,
        paddingLeft: ({showMenu}) => showMenu ? 280 : 0,
        transition: theme.transitions.create("padding-left", {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut
        }),
        [theme.breakpoints.down("mobile")]: {
            width: "100%",
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
        // overflow: 'auto'
    },
}));

const DELAY = 3000; //3 seconds

const ViewerLayout = (props) => {
    const {children, firebase} = props
    const {query: {livestreamId}} = useRouter()
    const {authenticatedUser, userData} = useAuth();
    const dispatch = useDispatch()
    const {breakpoints: {values}} = useTheme()
    const mobile = useMediaQuery(`(max-width:${values.mobile}px)`)
    const [open, setOpen] = React.useState(true);
    const [delayHandler, setDelayHandler] = useState(null)
    const [iconsDisabled, setIconsDisabled] = useState(false);
    const [showVideoButton, setShowVideoButton] = useState({paused: false, muted: false});
    const [play, setPlay] = useState(false);
    const [unmute, setUnmute] = useState(false);

    const [showMenu, setShowMenu] = useState(false);
    const [handRaiseActive, setHandRaiseActive] = useState(false);
    const [streamerId, setStreamerId] = useState(null);


    const classes = useStyles({showMenu, mobile})


    const populates = [{child: 'groupIds', root: 'careerCenterData', childAlias: 'careerCenters'}]
    useFirestoreConnect(() => livestreamId ? [
        {
            collection: "livestreams",
            doc: livestreamId,
            storeAs: "currentLivestream",
            populates
        }
    ] : [], [livestreamId])

    const currentLivestream = useSelector(({firestore}) => firestore.data.currentLivestream && {
        ...populate(firestore, "currentLivestream", populates),
        id: livestreamId
    })

    useEffect(() => {
        if (mobile) {
            setShowMenu(false)
        } else {
            setShowMenu(true);
        }
    }, [mobile]);

    useEffect(() => {
        if (userData && userData.userEmail && livestreamId) {
            firebase.setUserIsParticipating(livestreamId, userData);
        }
    }, [livestreamId, userData]);

    useEffect(() => {
        if (currentLivestream && !streamerId) {
            if (currentLivestream.test) {
                let uuid = uuidv4()
                let joiningId = uuid.replace(/-/g, '')
                setStreamerId(currentLivestream.id + joiningId)
            } else if (authenticatedUser?.email) {
                setStreamerId(currentLivestream.id + authenticatedUser.email)
            }
        }
    }, [currentLivestream, authenticatedUser])

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const handleMouseEnter = useCallback((event) => {
        clearTimeout(delayHandler)
        handleOpen()
    }, [])

    const handleMouseLeave = useCallback(() => {
        setDelayHandler(setTimeout(() => {
            handleClose()
        }, DELAY))
    }, [])

    const handleClap = useCallback(() => {
        postIcon('clapping')
    }, [])

    const handleLike = useCallback(() => {
        postIcon('like')
    }, [])
    const handleHeart = useCallback(() => {
        postIcon('heart')
    }, [])

    const postIcon = useCallback((iconName) => {
        if (!iconsDisabled) {
            dispatch(actions.createEmote(iconName))
            setIconsDisabled(true);
        }
    }, [iconsDisabled])

    const enableIcons = useCallback(() => {
        setIconsDisabled(false)
    }, [])

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

    if (!isLoaded(currentLivestream)) {
        return <Loader/>
    }


    return (
        <CurrentStreamContext.Provider value={{currentLivestream}}>
            <div className={classes.root}>
                <ViewerTopBar
                    mobile={mobile}
                    currentLivestream={currentLivestream}
                />
                <LeftMenu
                    handRaiseActive={handRaiseActive}
                    setHandRaiseActive={setHandRaiseActive}
                    streamer={false}
                    userData={userData}
                    user={authenticatedUser}
                    livestream={currentLivestream}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                    isMobile={mobile}
                    toggleShowMenu={toggleShowMenu}/>

                <div className={classes.wrapper}>
                    <div className={classes.contentContainer}>
                        <div className={classes.content}>
                            {React.cloneElement(children, {
                                ...props,
                                playVideos,
                                handRaiseActive,
                                unmuteVideos,
                                showMenu,
                                streamerId,
                                handleHeart,
                                handleLike,
                                handleClap,
                                enableIcons,
                                handleMouseLeave,
                                iconsDisabled,
                                handleMouseEnter,
                                handleClose,
                                DELAY
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </CurrentStreamContext.Provider>
    );
};

export default withFirebase(ViewerLayout);
