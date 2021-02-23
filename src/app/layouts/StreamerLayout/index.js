import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {withFirebase} from "../../context/firebase";
import {useAuth} from "../../HOCs/AuthProvider";
import StreamerTopBar from "./StreamerTopBar";
import PreparationOverlay from "../../components/views/streaming/preparation-overlay/PreparationOverlay";
import LeftMenu from "../../components/views/streaming/LeftMenu/LeftMenu";
import Loader from "../../components/views/loader/Loader";
import {useRouter} from "next/router";
import NotificationsContext from "../../context/notifications/NotificationsContext";

const CurrentStreamContext = createContext({currentLivestream: false});


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
    },
    contentContainer: {
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
    },
    content: {
        flex: '1 1 auto',
        height: '100%',
        overflow: 'auto'
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
    const {query: {token, livestreamId}} = useRouter()
    const router = useRouter();
    const [currentLivestream, setCurrentLivestream] = useState(false);
    const [numberOfViewers, setNumberOfViewers] = useState(0);
    const [newNotification, setNewNotification] = useState(null);
    const [notificationToRemove, setNotificationToRemove] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const [streamerReady, setStreamerReady] = useState(false);
    const [tokenChecked, setTokenChecked] = useState(false);
    const [showMenu, setShowMenu] = useState(true);

    const classes = useStyles({
        showMenu,
        hasStarted: currentLivestream?.hasStarted
    });


    useEffect(() => {
        if (livestreamId) {
            props.firebase.listenToScheduledLivestreamById(livestreamId, querySnapshot => {
                if (!querySnapshot.isEmpty) {
                    let livestream = querySnapshot.data();
                    livestream.id = querySnapshot.id;
                    setCurrentLivestream(livestream);
                }
            });
        }
    }, [livestreamId]);


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
    }, [router, token, currentLivestream]);

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

    const handleSetNumberOfViewers = useCallback((number) => setNumberOfViewers(number), [])


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

    if (!currentLivestream || !tokenIsValidated()) {
        return <Loader/>
    }

    if (!streamerReady && tokenIsValidated()) {
        return (
            <PreparationOverlay
                livestream={currentLivestream}
                streamerUuid={currentLivestream.id}
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
                        numberOfViewers={numberOfViewers}
                    />
                    <LeftMenu
                        className={classes.menuLeft}
                        streamer
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
                                    notifications,
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

export const useCurrentStream = () => useContext(CurrentStreamContext);

export default withFirebase(StreamerLayout);
