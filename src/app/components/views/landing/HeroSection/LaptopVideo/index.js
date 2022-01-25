import React from "react";
import { styled } from "@mui/material/styles";
import { blankLaptop, laptopUi } from "../../../../../constants/images";
import { smilingStreamerVideoUrl } from "../../../../../constants/videos";

const ImgLaptopImage = styled("img")(({ theme }) => ({
   width: "100%",
}));

const ImgLaptopUi = styled("img")(({ theme }) => ({
   width: "100%",
   position: "absolute",
   top: "50%",
   left: "50%",
   transform: "translate(-50%, -50%)",
   zIndex: 2,
}));

const DivLaptopScreenDiv = styled("div")(({ theme }) => ({
   top: "7.07%",
   left: "14.7%",
   width: "70.5%",
   height: "81.5%",
   justifyContent: "center",
   alignItems: "center",
   display: "flex",
   zIndex: 1,
   position: "absolute",
}));

const DivLaptopScreenInnerDiv = styled("div")(({ theme }) => ({
   position: "relative",
   width: "100%",
   height: "100%",
   background: theme.palette.common.black,
}));

const DivLaptopVideoWrapper = styled("div")(({ theme }) => ({
   top: "8%",
   left: "3.8%",
   right: "0.1%",
   bottom: "4.8%",
   position: "absolute",
   display: "flex",
   justifyContent: "center",
   alignItems: "center",
}));

const VideoLaptopVideo = styled("video")(({ theme }) => ({
   width: "100%",
   zIndex: 1,
}));

const DivLaptop = styled("div")(({ theme }) => ({
   width: "100%",
   position: "relative",
   "& img": {},

   "& video": {},
}));

const LaptopVideo = ({}) => {
   return (
      <DivLaptop>
         <DivLaptopScreenDiv>
            <DivLaptopScreenInnerDiv>
               <DivLaptopVideoWrapper>
                  <VideoLaptopVideo
                     autoPlay
                     loop
                     muted
                     src={smilingStreamerVideoUrl}
                  />
               </DivLaptopVideoWrapper>
               <div>
                  <ImgLaptopUi src={laptopUi} alt="ui" />
               </div>
            </DivLaptopScreenInnerDiv>
         </DivLaptopScreenDiv>
         <ImgLaptopImage src={blankLaptop} alt="stream showcase laptop" />
      </DivLaptop>
   );
};

export default LaptopVideo;
