import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {withFirebase} from "../../context/firebase";
import StreamerTopBar from "./StreamerTopBar";
import PreparationOverlay from "../../components/views/streaming/preparation-overlay/PreparationOverlay";
import LeftMenu from "../../components/views/streaming/LeftMenu/LeftMenu";
import Loader from "../../components/views/loader/Loader";
import {useRouter} from "next/router";
import NotificationsContext from "../../context/notifications/NotificationsContext";
import {CurrentStreamContext} from "../../context/stream/StreamContext";
import {v4 as uuidv4} from "uuid";
import {isLoaded, populate, useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import ViewerTopBar from "../ViewerLayout/ViewerTopBar";

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        width: '100%'
    },
    wrapper: {
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
        paddingTop: 55,
        paddingLeft: ({showMenu}) => showMenu ? 280 : 0,
        transition: theme.transitions.create("padding-left", {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut
        })
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
    menuLeft: {
        position: "absolute",
        transition: "width 0.3s",
        transitionTimingFunction: theme.transitions.easeInOut,
        width: ({showMenu}) => showMenu ? 280 : 0,
        top: 55,
        left: 0,
        bottom: 0,
        zIndex: 20,
        boxShadow: theme.shadows[7]
    },
}));

const StreamerLayout = (props) => {
    const {children, firebase} = props
    const {query: {token, livestreamId}, pathname} = useRouter()
    const router = useRouter();
    const [numberOfViewers, setNumberOfViewers] = useState(0);
    const [newNotification, setNewNotification] = useState(null);
    const [notificationToRemove, setNotificationToRemove] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [streamerId, setStreamerId] = useState(null);

    const [streamerReady, setStreamerReady] = useState(false);
    const [tokenChecked, setTokenChecked] = useState(false);
    const [showMenu, setShowMenu] = useState(true);
    const [audienceDrawerOpen, setAudienceDrawerOpen] = useState(false);



    const handleSetNumberOfViewers = useCallback((number) => setNumberOfViewers(number), [])
    const isMainStreamer = useMemo(() => pathname === "/streaming/[livestreamId]/main-streamer", [pathname])
    const populates = [{child: 'groupIds', root: 'careerCenterData', childAlias: 'careerCenters'}]
    useFirestoreConnect(() => livestreamId ? [
        {
            collection: "livestreams",
            doc: livestreamId,
            storeAs: "currentLivestream",
            populates
        },
        {
            collection: "livestreams",
            doc: livestreamId,
            subcollections: [
                {
                    collection: "participatingStudents",
                    // orderBy: ["joined", "asc"],
                }
            ],
            storeAs: "audience"
        }
    ] : [], [livestreamId])

    const currentLivestream = useSelector(({firestore}) => firestore.data.currentLivestream && {
        ...populate(firestore, "currentLivestream", populates),
        id: livestreamId
    })

    // const firestore = useSelector(({firestore}) => firestore)
    // console.log("-> firestore", firestore);

    const classes = useStyles({
        showMenu,
        hasStarted: currentLivestream?.hasStarted
    });


    useEffect(() => {
        if (router && router.query && currentLivestream && !currentLivestream.test) {
            if (!token) {
                router.push('/streaming/error')

            } else {
                firebase.getLivestreamSecureToken(currentLivestream.id).then(doc => {
                    if (!doc.exists) {
                        router.push('/streaming/error')
                    }
                    let storedToken = doc.data().value;
                    if (storedToken !== token) {
                        router.push('/streaming/error')
                    } else {
                        setTokenChecked(true);
                    }
                })
            }
        }
    }, [router, token, currentLivestream?.test, currentLivestream?.id]);

    useEffect(() => {
        const regex = /-/g;
        if (livestreamId && !isMainStreamer) {
            if (localStorage.getItem('streamingUuid')) {
                let storedUuid = localStorage.getItem('streamingUuid')
                let joiningId = storedUuid.replace(regex, '')
                setStreamerId(livestreamId + joiningId)
            } else {
                let uuid = uuidv4()
                let joiningId = uuid.replace(regex, '')
                localStorage.setItem('streamingUuid', joiningId)
                setStreamerId(livestreamId + joiningId)
            }
        } else if (currentLivestream?.id) {
            setStreamerId(currentLivestream.id)
        }
    }, [livestreamId, isMainStreamer, currentLivestream?.id])

    useEffect(() => {
        if (newNotification) {
            setNotifications([...notifications, newNotification]);
        }
    }, [newNotification]);

    useEffect(() => {
        if (notificationToRemove) {
            let updatedNotifications = notifications.filter(not => not.id !== notificationToRemove);
            setNotifications(updatedNotifications);
        }
    }, [notificationToRemove]);

    const showAudience = useCallback(() => {
        setAudienceDrawerOpen(true)
    }, []);

    const hideAudience = useCallback(() => {
        setAudienceDrawerOpen(false)
    }, []);


    const tokenIsValidated = () => {
        if (currentLivestream.test) {
            return true;
        } else {
            return tokenChecked;
        }
    }
    const toggleShowMenu = () => {
        setShowMenu(!showMenu)
    }

    if (!isLoaded(currentLivestream) || !tokenIsValidated()) {
        return <Loader/>
    }

    if (!streamerReady && tokenIsValidated()) {
        return (
            <PreparationOverlay
                livestream={currentLivestream}
                streamerUuid={streamerId}
                setStreamerReady={setStreamerReady}
            />
        )
    }


    return (
        <NotificationsContext.Provider value={{setNewNotification, setNotificationToRemove}}>
            <CurrentStreamContext.Provider value={{currentLivestream}}>
                <div className={classes.root}>
                    <StreamerTopBar
                        firebase={firebase}
                        showAudience={showAudience}
                        isMainStreamer={isMainStreamer}
                        numberOfViewers={numberOfViewers}
                    />
                    <LeftMenu
                        className={classes.menuLeft}
                        streamer={true}
                        livestream={currentLivestream}
                        showMenu={showMenu}
                        setShowMenu={setShowMenu}
                        toggleShowMenu={toggleShowMenu}/>

                    <div className={classes.wrapper}>
                        <div className={classes.contentContainer}>
                            <div className={classes.content}>
                                {React.cloneElement(children, {
                                    ...props,
                                    newNotification,
                                    isMainStreamer,
                                    isStreamer: true,
                                    hideAudience,
                                    audienceDrawerOpen,
                                    showMenu,
                                    notifications,
                                    streamerId,
                                    setNumberOfViewers: handleSetNumberOfViewers
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </CurrentStreamContext.Provider>
        </NotificationsContext.Provider>
    );
};

export default withFirebase(StreamerLayout);
