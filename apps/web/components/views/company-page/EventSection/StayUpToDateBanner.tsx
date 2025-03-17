import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { Box, Grid, Typography } from "@mui/material"
import Image from "next/legacy/image"
import { sxStyles } from "../../../../types/commonTypes"
import FollowButton from "../../common/company/FollowButton"
import { useCompanyPage } from "../index"

const styles = sxStyles({
   wrapper: {
      backgroundColor: "white",
      border: "1px solid rgba(103, 73, 234, 0.30)",
      borderRadius: "12px",
      p: 4,
      mt: 1,
   },
})

const StayUpToDateBanner = () => {
   const { group } = useCompanyPage()

   return (
      <Box sx={styles.wrapper}>
         <Grid container>
            <Grid item xs={3}>
               <Image
                  src="/illustrations/undraw_video_streaming.png"
                  width="100"
                  height="90"
                  alt="Stay up to date illustration"
                  objectFit={"contain"}
               />
            </Grid>
            <Grid item xs={9}>
               <Grid container spacing={2}>
                  <Grid item>
                     <Typography variant={"h6"} fontWeight={600}>
                        Stay up-to-date!
                     </Typography>
                  </Grid>
                  <Grid item>
                     <Typography variant={"body1"} fontSize={14}>
                        {`${group?.universityName} does not have any upcoming live
                        stream planned. Follow the company to show your interest
                        and notified as soon as they publish a new stream.`}
                     </Typography>
                  </Grid>
                  <Grid item>
                     <FollowButton
                        group={group}
                        color={"secondary"}
                        startIcon={null}
                        interactionSource={InteractionSources.Company_Page}
                     />
                  </Grid>
               </Grid>
            </Grid>
         </Grid>
      </Box>
   )
}

export default StayUpToDateBanner
