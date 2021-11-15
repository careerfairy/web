import React from "react";
import HeroSection from "./";
import HeroButton from "./HeroButton";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Link from "../../../../materialUI/NextNavLink";
const useStyles = makeStyles((theme) => ({
   subTitleHeader: {
      fontWeight: 600,
   },
   linkButton: {
      textDecoration: "none !important",
   },
}));
const StudentHeroSection = (props) => {
   const classes = useStyles();
   return (
      <HeroSection
         title={
            <>
               Looking at <b>post grad career</b> prospects but don't know where
               to <b>start?</b>
            </>
         }
         subTitle={
            <Box mt={3}>
               <Typography className={classes.subTitleHeader} variant="h4">
                  We've been there.
               </Typography>
               <Typography variant="h5">
                  We host sessions with top companies for you to learn more
                  about the opportunities for you.
               </Typography>
            </Box>
         }
         buttons={[
            <HeroButton
               href="/next-livestreams"
               className={classes.linkButton}
               component={Link}
               color="secondary"
               withGradient
               variant="contained"
            >
               View Upcoming Livestreams
            </HeroButton>,
         ]}
         {...props}
      />
   );
};

export default StudentHeroSection;
