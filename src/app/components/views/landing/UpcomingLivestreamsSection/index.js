import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import { Box } from "@material-ui/core";
import { useFirebase } from "../../../../context/firebase";
import UpcomingLivestreamsCarousel from "./UpcomingLivestreamsCarousel";

const useStyles = makeStyles((theme) => ({
   section: {
      paddingBottom: 20,
      [theme.breakpoints.down("sm")]: {
         paddingTop: 40,
      },
      // paddingTop: 0
   },
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
   title: {
      fontSize: "4.5rem",
      fontWeight: 500,
      [theme.breakpoints.down("xs")]: {
         fontSize: "3.5rem",
      },
   },
}));

const UpcomingLivestreamsSection = (props) => {
   const classes = useStyles();
   const { getUpcomingLivestreams } = useFirebase();
   const [upcomingLivestreams, setUpcomingLivestreams] = useState([]);

   useEffect(() => {
      (async function () {
         const newStreamSnaps = await getUpcomingLivestreams(15);
         const newStreams = newStreamSnaps.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }));
         setUpcomingLivestreams(newStreams);
      })();
   }, []);

   return (
      <Section
         className={classes.section}
         big={props.big}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <Box>
            <UpcomingLivestreamsCarousel
               upcomingStreams={upcomingLivestreams}
            />
         </Box>
      </Section>
   );
};

export default UpcomingLivestreamsSection;

UpcomingLivestreamsSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
