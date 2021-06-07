import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { blankLaptop, blankUIQAndA } from "../../../../../constants/images";
import { smilingStreamerVideoUrl } from "../../../../../constants/videos";

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
      // background: "#e3f7f5",
      zIndex: 2,
   },
   laptopScreenDiv: {
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
      zIndex: 1,
      position: "absolute",
      width: "67.7%",
      height: "81.3%",
      top: "7.1%",
      left: "17.5%",
   },
   laptopScreenInnerDiv: {
      // border: "1px solid red",
      position: "relative",
      width: "100%",
      height: "100%",
      background: theme.palette.common.black,
   },
   laptopVideo: {
      width: "100%",
      position: "absolute",
      top: "47.5%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      // background: "#e3f7f5",
      zIndex: 1,
   },
   laptop: {
      width: "100%",
      maxWidth: "1200px",
      position: "relative",
      "& img": {},
      "& video": {
         // zIndex: 1,
         // position: "absolute",
         // width: "67.7%",
         // height: "81.3%",
         // background: "#e3f7f5",
         // top: "7.1%",
         // left: "17.5%",
      },
   },
}));

const LaptopVideo = ({}) => {
   const classes = useStyles();

   return (
      <div className={classes.laptop}>
         <div className={classes.laptopScreenDiv}>
            <div className={classes.laptopScreenInnerDiv}>
               <video
                  className={classes.laptopVideo}
                  autoPlay
                  loop
                  src={smilingStreamerVideoUrl}
               />
               <div>
                  <img
                     className={classes.laptopUi}
                     src={blankUIQAndA}
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
