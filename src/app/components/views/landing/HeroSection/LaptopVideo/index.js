import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {blankLaptop, blankUIQAndA, laptopUi} from "../../../../../constants/images";
import {smilingStreamerVideoUrl} from "../../../../../constants/videos";

const useStyles = makeStyles((theme) => ({
    laptopImage: {
        width: "100%",
    },
    laptopUi: {
        width: "100%",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2,
    },
    laptopScreenDiv: {
        top: "7.07%",
        left: "14.8%",
        width: "70.4%",
        height: "81.4%",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        zIndex: 1,
        position: "absolute",
    },
    laptopScreenInnerDiv: {
        position: "relative",
        width: "100%",
        height: "100%",
        background: theme.palette.common.black,
    },
    laptopVideoWrapper: {
        top: "8%",
        left: "3.8%",
        right: "0.1%",
        bottom: "4.85%",
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    laptopVideo: {
        width: "100%",
        zIndex: 1,
    },
    laptop: {
        width: "100%",
        maxWidth: "1200px",
        position: "relative",
        "& img": {},
        "& video": {
        },
    },
}));

const LaptopVideo = ({}) => {
    const classes = useStyles();

    return (
        <div className={classes.laptop}>
            <div className={classes.laptopScreenDiv}>
                <div className={classes.laptopScreenInnerDiv}>
                    <div className={classes.laptopVideoWrapper}>
                        <video
                            className={classes.laptopVideo}
                            autoPlay
                            loop
                            muted
                            src={smilingStreamerVideoUrl}
                        />
                    </div>
                    <div>
                        <img
                            className={classes.laptopUi}
                            src={laptopUi}
                            alt="ui"
                        />
                    </div>
                </div>
            </div>
            <img
                className={classes.laptopImage}
                src={blankLaptop}
                alt="stream showcase laptop"
            />
        </div>
    );
};

export default LaptopVideo;
