import { NetworkerBadge } from "@careerfairy/shared-lib/badges/NetworkBadges"
import { Badge } from "@careerfairy/shared-lib/badges/badges"
import { getUserBadges } from "@careerfairy/shared-lib/users/UserBadges"
import { LinearProgress, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { useAuth } from "../../../../HOCs/AuthProvider"
import BadgeIcon from "../../common/BadgeIcon"

const BadgeProgress = () => {
   const { userData, userStats } = useAuth()
   const userBadges = getUserBadges(userData.badges)

   // hide the progress bar if the user already has the badge
   if (userBadges.networkerBadge()) {
      return null
   }

   // we only have the networker badge for now, we need to change this in the future
   const networkerBadge = userBadges.networkerBadge()
   let nextBadge: Badge

   if (!networkerBadge) {
      nextBadge = NetworkerBadge
   }
   const progress = nextBadge.progress(userStats)

   return (
      <Grid container mt={2}>
         <Grid item xs={12}>
            <Typography
               sx={{
                  color: "text.secondary",
                  alignItems: "center",
                  display: "flex",
               }}
               variant="h6"
            >
               Earn your first badge: &nbsp;
               <BadgeIcon badgeKey={nextBadge.key} /> &nbsp; {nextBadge.name}
            </Typography>
            <p>Objective: {nextBadge.requirements[0].description}</p>
            <p>
               {nextBadge.rewardsDescription.length === 1
                  ? "Reward"
                  : "Rewards"}
               : {nextBadge.rewardsDescription.join(", ")}
            </p>
         </Grid>
         <Grid item xs={12}>
            <Box sx={{ width: "100%" }}>
               <LinearProgressBar progressValue={progress} />
            </Box>
         </Grid>
      </Grid>
   )
}

const LinearProgressBar = ({ progressValue }) => {
   return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
         <Box sx={{ width: "100%", mr: 1 }}>
            <LinearProgress
               variant="determinate"
               sx={{
                  height: 10,
                  borderRadius: 5,
               }}
               value={progressValue}
            />
         </Box>
         <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${Math.round(
               progressValue
            )}%`}</Typography>
         </Box>
      </Box>
   )
}

export default BadgeProgress
