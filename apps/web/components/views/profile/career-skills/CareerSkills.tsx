import { Grid, Tooltip, Typography } from "@mui/material"
import React, { useCallback, useState } from "react"
import ContentCard from "../../../../layouts/UserLayout/ContentCard"
import Box from "@mui/material/Box"
import ContentCardTitle from "../../../../layouts/UserLayout/ContentCardTitle"
import { styles as profileStyles } from "../profileStyles"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { BadgeStepper } from "./SkillsStepper"
import { sxStyles } from "types/commonTypes"
import { ResearchBadge } from "@careerfairy/shared-lib/dist/badges/ResearchBadges"
import { NetworkerBadge } from "@careerfairy/shared-lib/dist/badges/NetworkBadges"
import { EngageBadge } from "@careerfairy/shared-lib/dist/badges/EngageBadges"

const styles = sxStyles({
   laneTitle: {
      fontWeight: 700,
      fontSize: "1.5rem",
   },
   step: {
      "& .MuiStepLabel-iconContainer": {
         backgroundColor: "black",
      },
   },
})

const CareerSkills = () => {
   return (
      <ContentCard>
         <Grid container spacing={2} mb={4}>
            <Grid item xs={12} md={8}>
               <ContentCardTitle>My Career Skills</ContentCardTitle>
            </Grid>

            <Grid item xs={12} md={8}>
               <Box>
                  <Typography sx={profileStyles.subtitle}>
                     Boost your career by leveraging powerful features inside
                     our platform. Check the requirements of each level to know
                     how to progress. By reaching more advanced levels{" "}
                     {"you'll"} get more benefits and standout from the crowd!
                  </Typography>
               </Box>
            </Grid>
         </Grid>

         <Box mb={4}>Placeholder for context info</Box>

         <BadgeProgress name="Research" badge={ResearchBadge} />
         <BadgeProgress name="Network" badge={NetworkerBadge} />
         <BadgeProgress name="Engage" badge={EngageBadge} />
      </ContentCard>
   )
}

const BadgeProgress = ({ name, badge }) => {
   const [showTooltip, setShowTooltip] = useState(false)
   const openTooltip = useCallback(() => setShowTooltip(true), [])
   const hideTooltip = useCallback(() => setShowTooltip(false), [])

   return (
      <Box mb={3}>
         <Box mb={4} display="flex" alignItems="center">
            <Typography sx={styles.laneTitle}>{name}</Typography>

            <Tooltip
               title="Helper text"
               placement="right"
               open={showTooltip}
               onOpen={openTooltip}
               onClose={hideTooltip}
            >
               <InfoOutlinedIcon
                  onClick={openTooltip}
                  sx={{ marginLeft: "10px" }}
               />
            </Tooltip>
         </Box>

         <Grid container>
            <Grid item xs={12} md={8}>
               <BadgeStepper badge={badge} />
            </Grid>
         </Grid>
      </Box>
   )
}

// const IconContainer = ({ children }) => {
//    return <InfoOutlinedIcon />
// }

export default CareerSkills
