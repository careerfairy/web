import React, {Fragment} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import ViewerComponent from "./viewer-component/ViewerComponent";
import MiniChatContainer from "../streaming/LeftMenu/categories/chat/MiniChatContainer";
import EmoteButtons from "./EmoteButtons";
import IconsContainer from "../streaming/icons-container/IconsContainer";
import RatingContainer from "./rating-container/RatingContainer";
import {Backdrop} from "@material-ui/core";
import VolumeUpRoundedIcon from "@material-ui/icons/VolumeUpRounded";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import {useCurrentStream} from "../../../context/stream/StreamContext";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
    iconsContainer: {
        position: "absolute",
        bottom: ({mobile}) => mobile ? 80 : 60,
        right: 60,
        // zIndex: 100,
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
                            handleClap,
                            unmute,
                            play,
                            open,
                            handleHeart,
                            handleLike,
                            handleMouseEnter,
                            playVideos,
                            enableIcons,
                            handleMouseLeave,
                            showMenu,
                            iconsDisabled,
                            mobile,
                            unmuteVideos,
                            DELAY,
                            setShowVideoButton,
                            handleClose
                        }) => {

    const {currentLivestream} = useCurrentStream()

    const classes = useStyles({mobile})

    return (
        <Fragment>
            <div className={clsx({
                [classes.blackFrame]: true,
            })}>
                <ViewerComponent
                    livestreamId={currentLivestream.id} streamerId={streamerId}
                    currentLivestream={currentLivestream} handRaiseActive={handRaiseActive}
                    showVideoButton={showVideoButton}
                    setShowVideoButton={setShowVideoButton} unmute={unmute} play={play}
                />

                {!mobile &&
                <MiniChatContainer className={classes.miniChatContainer} livestream={currentLivestream}
                                   isStreamer={false}/>}

                <EmoteButtons
                    handRaiseActive={handRaiseActive}
                    handleClose={handleClose}
                    handleClap={handleClap}
                    handleHeart={handleHeart}
                    handleLike={handleLike}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    iconsDisabled={iconsDisabled}
                    enableIcons={enableIcons}
                    delay={DELAY}
                    smoothness={2}
                    open={open}
                />
            </div>
            <IconsContainer className={classes.iconsContainer}
                            isTest={currentLivestream.test}
                            livestreamId={currentLivestream.id}/>
            {currentLivestream && !currentLivestream.hasNoRatings &&
            <RatingContainer livestreamId={currentLivestream.id}
                             livestream={currentLivestream}/>}
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
        </Fragment>
    );
};

export default ViewerOverview;
