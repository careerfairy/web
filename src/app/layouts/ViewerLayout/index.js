import React, {createContext, useEffect, useState} from 'react';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {withFirebase} from "../../context/firebase";
import {useRouter} from "next/router";
import ViewerTopBar from "./ViewerTopBar";
import {populate, useFirestoreConnect, isEmpty, isLoaded} from "react-redux-firebase";
import {useSelector} from "react-redux";
import {useAuth} from "../../HOCs/AuthProvider";
import Loader from "../../components/views/loader/Loader";
import {useMediaQuery} from "@material-ui/core";
import LeftMenu from "../../components/views/viewer/LeftMenu/LeftMenu";

const CurrentStreamContext = createContext({currentLivestream: false});


const useStyles = makeStyles((theme) => ({
    menuLeft: {
        position: "absolute",
        boxShadow: theme.shadows[5],
        width: ({showMenu, mobile}) => showMenu ? (mobile ? "100%" : 280) : 0,
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 20,
        [theme.breakpoints.up("mobile")]: {
            top: 55,
        },
        transition: theme.transitions.create("width", {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut
        }),
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

const ViewerLayout = (props) => {
    const {children, firebase} = props
    const {query: {livestreamId}} = useRouter()
    const {authenticatedUser, userData} = useAuth();
    const {breakpoints:{values}} = useTheme()
    const mobile = useMediaQuery(`(max-width:${values.mobile}px)`)

    const [showMenu, setShowMenu] = useState(false);
    const [handRaiseActive, setHandRaiseActive] = useState(false);

    const classes = useStyles({showMenu})


    const populates = [{child: 'groupIds', root: 'careerCenterData', childAlias: 'careerCenters'}]
    useFirestoreConnect(() => livestreamId ? [
        {
            collection: "livestreams",
            doc: livestreamId,
            storeAs: "currentLivestream",
            populates
        }
    ] : [], [livestreamId])

    const currentLivestream = useSelector(({firestore}) => firestore.data.currentLivestream &&  {...populate(firestore, "currentLivestream", populates), id: livestreamId})
    console.log("-> currentLivestream", currentLivestream);

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

    const toggleShowMenu = () => {
        setShowMenu(!showMenu)
    }

    if(!isLoaded(currentLivestream)){
        return <Loader/>
    }


    return (
        <div className={classes.root}>
            <ViewerTopBar
                mobile={mobile}
                currentLivestream={currentLivestream}
            />
            <LeftMenu
                className={classes.menuLeft}
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
                        {/*{React.cloneElement(children, {*/}
                        {/*    ...props,*/}
                        {/*    newNotification,*/}
                        {/*    isMainStreamer,*/}
                        {/*    isStreamer: true,*/}
                        {/*    showMenu,*/}
                        {/*    notifications,*/}
                        {/*    streamerId,*/}
                        {/*    setNumberOfViewers: handleSetNumberOfViewers*/}
                        {/*})}*/}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default withFirebase(ViewerLayout);
