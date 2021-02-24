import React, {Fragment} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import VideoContainer from "./video-container/VideoContainer";
import NotificationsContainer from "./notifications-container/NotificationsContainer";
import MiniChatContainer from "./LeftMenu/categories/chat/MiniChatContainer";
import IconsContainer from "./icons-container/IconsContainer";
import {useCurrentStream} from "../../../context/stream/StreamContext";

const useStyles = makeStyles(theme => ({
    blackFrame: {
        // left: ({showMenu}) => showMenu ? 280 : 0,
        // transition: "left 0.3s",
        transitionTimingFunction: theme.transitions.easeInOut,
        position: "relative",
        // top: 55,
        // right: 0,
        // left:0,
        minWidth: 400,
        // height: "calc(100% - 55px)",
        zIndex: 10,
        backgroundColor: "black",
        // flex: '1 1 auto',
        // height: '100%',
        // overflow: 'auto'
    },
    miniChatContainer: {
        position: "absolute",
        bottom: 0,
        right: 120,
        width: "20%",
        minWidth: 250,
        zIndex: 100
    },
    iconsContainer: {
        position: "absolute",
        bottom: 60,
        right: 100,
        zIndex: 100,
        width: 80
    }
}));

const StreamerOverview = ({isStreamer, setNumberOfViewers, showMenu, notifications, streamerId}) => {
    const {currentLivestream} = useCurrentStream()
    const classes = useStyles()

    return (
        <Fragment>
            <div
                className={classes.blackFrame}
            >
                <VideoContainer currentLivestream={currentLivestream}
                                streamerId={streamerId}
                                setNumberOfViewers={setNumberOfViewers}
                                showMenu={showMenu} viewer={false}
                />
            </div>
            <NotificationsContainer
                livestreamId={currentLivestream.id}
                notifications={notifications}
            />
            <MiniChatContainer
                className={classes.miniChatContainer}
                livestream={currentLivestream}
                isStreamer={isStreamer}
            />
            <IconsContainer
                className={classes.iconsContainer}
                isTest={currentLivestream.test}
                livestreamId={currentLivestream.id}/>
        </Fragment>
    );
};

export default StreamerOverview;
