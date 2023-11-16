import React from "react"
import HeroSection from "./"
import HeroButton from "./HeroButton"
import { Box, Typography } from "@mui/material"
import Link from "../../../../materialUI/NextNavLink"
import { playIcon } from "../../../../constants/images"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   subTitleHeader: {
      fontWeight: 600,
   },
   linkButton: {
      textDecoration: "none !important",
   },
})
const StudentHeroSection = (props) => {
   return (
      <HeroSection
         title={
            <>
               Looking for your <b>dream job</b> but don&apos;t know where to{" "}
               <b>start?</b>
            </>
         }
         subTitle={
            <Box mt={3}>
               <Typography sx={styles.subTitleHeader} variant="h4">
                  We&apos;ve been there.
               </Typography>
               <Typography variant="h5">
                  We host sessions with employees and recruiters from hundreds
                  of companies to help you land that job.
               </Typography>
            </Box>
         }
         buttons={[
            <HeroButton
               href="/portal"
               component={Link}
               color="secondary"
               withGradient
               variant="contained"
               iconUrl={playIcon}
               key="upcomingLivestreamsButton"
            >
               View Upcoming Livestreams
            </HeroButton>,
         ]}
         {...props}
      />
   )
}

export default StudentHeroSection
