import React, {Fragment} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import VideoContainer from "./video-container/VideoContainer";
import NotificationsContainer from "./notifications-container/NotificationsContainer";
import MiniChatContainer from "./LeftMenu/categories/chat/MiniChatContainer";
import IconsContainer from "./icons-container/IconsContainer";
import {useCurrentStream} from "../../../context/stream/StreamContext";
import StreamNotifications from "./sharedComponents/StreamNotifications";
import AudienceDrawer from "./AudienceDrawer";
import ButtonComponent from "./sharedComponents/ButtonComponent";

const useStyles = makeStyles(theme => ({
    blackFrame: {
        position: "absolute",
        left: "0",
        right: "0",
        bottom: "0",
        // left: ({showMenu}) => showMenu ? 280 : 0,
        // transition: "left 0.3s",
        transitionTimingFunction: theme.transitions.easeInOut,
        // position: "relative",
        // top: 55,
        // right: 0,
        // left:0,
        // minWidth: 345,
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
        right: 40,
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

const StreamerOverview = ({
                              isStreamer,
                              showAudience,
                              setSliding,
                              selectedState,
                              handleStateChange,
                              setNumberOfViewers,
                              setShowMenu,
                              showMenu,
                              notifications,
                              streamerId,
                              smallScreen,
                              hideAudience,
                              audienceDrawerOpen
                          }) => {
    const {currentLivestream} = useCurrentStream()
    const classes = useStyles()

    return (
        <Fragment>
            <div
                className={classes.blackFrame}
            >
                <VideoContainer currentLivestream={currentLivestream}
                                streamerId={streamerId}
                                smallScreen={smallScreen}
                                setNumberOfViewers={setNumberOfViewers}
                                showMenu={showMenu} viewer={false}
                />
                <ButtonComponent
                    setShowMenu={setShowMenu}
                    streamer={true}
                    setSliding={setSliding}
                    selectedState={selectedState}
                    showMenu={showMenu}
                    handleStateChange={handleStateChange}/>
            </div>
            <AudienceDrawer
                hideAudience={hideAudience}
                audienceDrawerOpen={audienceDrawerOpen}
                isStreamer
            />
            <NotificationsContainer
                livestreamId={currentLivestream.id}
                notifications={notifications}
            />
            <StreamNotifications isStreamer={true}/>
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
