import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Collapse } from "@material-ui/core";
import BreakoutRoomBanner from "../../../banners/BreakoutRoomBanner";
import HandRaiseStreamerBanner from "../../../banners/HandRaiseStreamerBanner";
import { STREAM_ELEMENT_SPACING } from "../../../../../constants/streams";
import HandRaiseViewerBanner from "../../../banners/HandRaiseViewerBanner";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
   bannerTop: {
      "& > :last-child": {},
      "& > *": {
         margin: theme.spacing(
            STREAM_ELEMENT_SPACING,
            STREAM_ELEMENT_SPACING,
            0
         ),
      },
   },
   bannerBottom: {
      "& > :last-child": {},
      "& > *": {
         margin: theme.spacing(
            0,
            STREAM_ELEMENT_SPACING,
            STREAM_ELEMENT_SPACING
         ),
      },
   },
}));

const Banners = ({ presenter, handRaiseActive, isBottom , mobile}) => {
   const {
      query: { breakoutRoomId },
   } = useRouter();

   const [showBreakoutBanner, setShowBreakoutBanner] = useState(false);
   const [showViewerHandRaiseBanner, setShowViewerHandRaiseBanner] = useState(
      false
   );
   const [
      showStreamerHandRaiseBanner,
      setShowStreamerHandRaiseBanner,
   ] = useState(false);

   const classes = useStyles();
   useEffect(() => {
      setShowBreakoutBanner(Boolean(presenter && breakoutRoomId));
   }, [presenter, breakoutRoomId]);

   useEffect(() => {
      setShowStreamerHandRaiseBanner(Boolean(presenter && handRaiseActive));
      setShowViewerHandRaiseBanner(Boolean(!presenter && handRaiseActive && !mobile));
   }, [presenter, handRaiseActive, mobile]);

   return (
      <div className={isBottom ? classes.bannerBottom : classes.bannerTop}>
         <Collapse in={showViewerHandRaiseBanner} unmountOnExit>
            <HandRaiseViewerBanner />
         </Collapse>
         <Collapse in={showBreakoutBanner} unmountOnExit>
            <BreakoutRoomBanner />
         </Collapse>
         <Collapse in={showStreamerHandRaiseBanner} unmountOnExit>
            <HandRaiseStreamerBanner />
         </Collapse>
      </div>
   );
};

export default Banners;
