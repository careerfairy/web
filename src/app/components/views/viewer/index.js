import React, {Fragment} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import ViewerComponent from "./viewer-component/ViewerComponent";
import MiniChatContainer from "../streaming/LeftMenu/categories/chat/MiniChatContainer";
import IconsContainer from "../streaming/icons-container/IconsContainer";
import RatingContainer from "./rating-container/RatingContainer";
import {Backdrop} from "@material-ui/core";
import VolumeUpRoundedIcon from "@material-ui/icons/VolumeUpRounded";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import {useCurrentStream} from "../../../context/stream/StreamContext";
import clsx from "clsx";
import StreamNotifications from "../streaming/sharedComponents/StreamNotifications";
import AudienceDrawer from "../streaming/AudienceDrawer";
import ButtonComponent from "../streaming/sharedComponents/ButtonComponent";
import StreamClosedCountdown from "../streaming/sharedComponents/StreamClosedCountdown";

const useStyles = makeStyles(theme => ({
    iconsContainer: {
        position: "absolute",
        bottom: ({mobile}) => mobile ? 80 : 60,
        right: 60,
        width: 80,
        zIndex: 7250
    },
    backdrop: {
        cursor: "pointer",
        zIndex: 200
    },
    backdropContent: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: theme.palette.common.white
    },
    miniChatContainer: {
        position: "absolute",
        bottom: "0",
        right: "40px",
        width: "20%",
        minWidth: "250px",
        zIndex: 7250
    },
    blackFrame: {
        zIndex: 10,
        backgroundColor: "black",
        position: "absolute",
        left: "0",
        right: "0",
        bottom: "0",
        top: 0,
        [theme.breakpoints.down("mobile")]: {
            width: "100%",
        },
    },
}));

const ViewerOverview = ({
                            handRaiseActive,
                            streamerId,
                            showVideoButton,
                            unmute,
                            play,
                            playVideos,
                            mobile,
                            unmuteVideos,
                            setShowMenu,
                            handleStateChange,
                            selectedState,
                            showMenu,
                            setShowVideoButton,
                            hideAudience,
                            audienceDrawerOpen,
                            isRecording
                        }) => {
    const {currentLivestream, isBreakout} = useCurrentStream()

    const classes = useStyles({mobile})
    return (
        <Fragment>
            <div className={clsx({
                [classes.blackFrame]: true,
            })}>
                <AudienceDrawer
                    hideAudience={hideAudience}
                    audienceDrawerOpen={audienceDrawerOpen}
                    isStreamer={false}
                />
                <ButtonComponent
                    selectedState={selectedState}
                    setShowMenu={setShowMenu}
                    showMenu={showMenu}
                    isMobile={mobile}
                    handleStateChange={handleStateChange} streamer={false}
                    isRecording={isRecording}
                />
                <ViewerComponent
                    livestreamId={currentLivestream.id} streamerId={streamerId}
                    currentLivestream={currentLivestream} handRaiseActive={handRaiseActive}
                    showVideoButton={showVideoButton}
                    isBreakout={isBreakout} isRecording={isRecording}
                    setShowVideoButton={setShowVideoButton} unmute={unmute} play={play}
                />

                { <MiniChatContainer mobile={mobile} className={classes.miniChatContainer}
                                                livestream={currentLivestream}
                                                isStreamer={false}/> }


            </div>
            <IconsContainer className={classes.iconsContainer}
                            isTest={currentLivestream.test}
                            livestreamId={currentLivestream.id}/>
            {currentLivestream && !currentLivestream.hasNoRatings &&
            <RatingContainer livestreamId={currentLivestream.id}
                             livestream={currentLivestream}/>}
            <StreamNotifications isStreamer={false}/>
            <Backdrop
                open={Boolean(showVideoButton.muted)}
                className={classes.backdrop}
                onClick={unmuteVideos}>
                <div className={classes.backdropContent}>
                    <VolumeUpRoundedIcon style={{fontSize: '3rem'}}/>
                    <div>Click to unmute</div>
                </div>
            </Backdrop>
            <Backdrop
                open={Boolean(showVideoButton.paused)}
                className={classes.backdrop}
                onClick={playVideos}>
                <div className={classes.backdropContent}>
                    <PlayArrowRoundedIcon style={{fontSize: '3rem'}}/>
                    <div>Click to play</div>
                </div>
            </Backdrop>
            <StreamClosedCountdown/>
        </Fragment>
    );
};

export default ViewerOverview;
