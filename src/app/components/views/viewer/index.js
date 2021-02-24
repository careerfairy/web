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

const useStyles = makeStyles(theme => ({}));

const ViewerOverview = ({
                            handRaiseActive,
                            livestreamId,
                            showMenu,
                            streamerId,
                            showVideoButton,
                            handleClap,
                            unmute,
                            play,
                            handleHeart,
                            handleLike,
                            handleMouseEnter,
                            playVideos,
                            enableIcons,
                            handleMouseLeave,
                            iconsDisabled,
                            unmuteVideos,
                            DELAY,
                            setShowVideoButton,
                            handleClose
                        }) => {

   const {currentLivestream} = useCurrentStream()

    const classes = useStyles()

    return (
        <Fragment>
            <ViewerComponent
                livestreamId={currentLivestream.id} streamerId={streamerId}
                currentLivestream={currentLivestream} handRaiseActive={handRaiseActive}
                showVideoButton={showVideoButton}
                setShowVideoButton={setShowVideoButton} unmute={unmute} play={play}/>

            {width >= 768 &&
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
