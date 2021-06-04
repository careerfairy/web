import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { blankLaptop } from "../../../../../constants/images";
import { smilingStreamerVideoUrl } from "../../../../../constants/videos";

const useStyles = makeStyles((theme) => ({
   laptop: {
      width: "100%",
      maxWidth: "1200px",
      position: "relative",
      "& img": {
         width: "100%",
      },
      "& video": {
         position: "absolute",
         width: "67.7%",
         height: "81.3%",
         background: "#000",
         top: "7.1%",
         left: "17.5%",
      },
   },
}));

const LaptopVideo = ({}) => {
   const classes = useStyles();

   return (
      <div className={classes.laptop}>
         <img src={blankLaptop} alt="stream showcase laptop" />
         <video autoPlay loop src={smilingStreamerVideoUrl} />
      </div>
   );
};

export default LaptopVideo;
