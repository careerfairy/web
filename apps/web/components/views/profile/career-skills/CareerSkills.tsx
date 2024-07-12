import { EngageBadge } from "@careerfairy/shared-lib/badges/EngageBadges"
import { NetworkerBadge } from "@careerfairy/shared-lib/badges/NetworkBadges"
import { ResearchBadge } from "@careerfairy/shared-lib/badges/ResearchBadges"
import { Badge } from "@careerfairy/shared-lib/badges/badges"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Grid,
   List,
   ListItem,
   ListItemAvatar,
   ListItemText,
   Tooltip,
   Typography,
} from "@mui/material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import { DefaultTheme } from "@mui/styles"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { useAuth } from "../../../../HOCs/AuthProvider"
import {
   ContextInfoDetail,
   ContextInfoMap,
} from "../../../../constants/contextInfoCareerSkills"
import ContentCard from "../../../../layouts/UserLayout/ContentCard"
import ContentCardTitle from "../../../../layouts/UserLayout/ContentCardTitle"
import Link from "../../common/Link"
import { styles as profileStyles } from "../profileStyles"
import { BadgeStepper, LevelInformationPopupListItem } from "./BadgeStepper"

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
   contextInfo: {
      padding: 2,
      boxShadow: (theme: DefaultTheme) => theme.legacy.boxShadows.dark_8_25_10,
   },
   unlockedSummary: {
      justifyContent: "start",
      paddingX: 1,
      minHeight: 0,
      ".MuiAccordionSummary-content": {
         flexGrow: 0,
         margin: 0,
      },
   },
})

const CareerSkills = () => {
   return (
      <ContentCard>
         <Grid container spacing={2} mb={4}>
            <Grid item xs={12} lg={8}>
               <ContentCardTitle>My Career Skills</ContentCardTitle>
            </Grid>

            <Grid item xs={12} lg={8}>
               <Box>
                  <Typography sx={profileStyles.subtitle}>
                     Boost your career by leveraging powerful features inside
                     our platform. Check the requirements of each level to know
                     how to progress. By reaching more advanced levels{" "}
                     {"you'll"} get more benefits and standout from the crowd!
                  </Typography>
               </Box>
            </Grid>

            <Grid item xs={12} lg={8}>
               <Box mt={4} mb={4}>
                  <Button
                     component={Link}
                     href={"/next-livestreams"}
                     style={{ textDecoration: "none" }}
                     color="secondary"
                     variant="contained"
                     sx={{
                        padding: "10px 40px",
                     }}
                  >
                     Browse Events
                  </Button>
               </Box>
            </Grid>

            <ContextInfo />
         </Grid>

         <BadgeProgress
            name="Research"
            badge={ResearchBadge}
            helperText="The more you progress through these levels, the more exclusive content you'll have access to."
         />
         <BadgeProgress
            name="Network"
            badge={NetworkerBadge}
            helperText="The more you progress through these levels, the easier it will be for you to increase your network."
         />
         <BadgeProgress
            name="Engage"
            badge={EngageBadge}
            helperText="The more you progress through these levels, the easier it will be for you to engage with company recruiters."
         />
      </ContentCard>
   )
}

const BadgeProgress = ({ name, badge, helperText }) => {
   const [showTooltip, setShowTooltip] = useState(false)
   const openTooltip = useCallback(() => setShowTooltip(true), [])
   const hideTooltip = useCallback(() => setShowTooltip(false), [])

   return (
      <Box mb={3}>
         <Box mb={4} display="flex" alignItems="center">
            <Typography sx={styles.laneTitle}>{name}</Typography>

            <Tooltip
               title={helperText}
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
            <Grid item xs={12} lg={8}>
               <BadgeStepper badge={badge} />

               <Box mt={2}>
                  <UnlockedRewardsAccordion badge={badge} />
               </Box>
            </Grid>
         </Grid>
      </Box>
   )
}

const ContextInfo = () => {
   const {
      query: { contextInfoKey },
   } = useRouter()

   if (!contextInfoKey) return null

   const contextInfoDetail: ContextInfoDetail =
      ContextInfoMap[contextInfoKey as string]

   if (!contextInfoDetail) return null

   return (
      <Grid item xs={12} lg={8}>
         <Box mb={4}>
            <Card sx={styles.contextInfo}>
               <Typography
                  mb={2}
                  dangerouslySetInnerHTML={{
                     __html: contextInfoDetail.message,
                  }}
               />

               {contextInfoDetail.showRequirements ? (
                  <>
                     <Typography mb={1}>Requirements:</Typography>
                     <RequirementsForABadge
                        badge={contextInfoDetail.badgeRequired}
                     />
                  </>
               ) : null}
            </Card>
         </Box>
      </Grid>
   )
}

const UnlockedRewardsAccordion = ({ badge }: { badge: Badge }) => {
   const { userPresenter } = useAuth()
   const currentUserBadgeLevel =
      userPresenter.badges?.getCurrentBadgeLevelForBadgeType(badge)

   const unlockedRewards = currentUserBadgeLevel?.getAllRewards() ?? []

   return (
      <Accordion
         elevation={0}
         disableGutters
         sx={{ backgroundColor: "inherit" }}
      >
         <AccordionSummary
            expandIcon={<ExpandMoreIcon color="secondary" />}
            aria-controls="unlockedRewards-content"
            id="unlockedRewards-header"
            sx={styles.unlockedSummary}
         >
            <Typography>Unlocked Rewards</Typography>
         </AccordionSummary>
         <AccordionDetails sx={{ paddingY: 0, marginTop: 1 }}>
            <List sx={{ paddingY: 0 }}>
               {unlockedRewards.map((reward, index) => (
                  <ListItem key={`reward_${index}`} sx={{ padding: 0 }}>
                     <ListItemAvatar
                        sx={{
                           minWidth: "25px",
                           display: "flex",
                           alignItems: "center",
                        }}
                     >
                        <CheckCircleOutlineIcon
                           color="primary"
                           sx={{
                              width: "0.9em",
                              height: "0.9em",
                           }}
                        />
                     </ListItemAvatar>
                     <ListItemText primary={reward} />
                  </ListItem>
               ))}

               {unlockedRewards.length === 0 && (
                  <ListItem sx={{ padding: 0 }}>
                     <ListItemText primary="You did not unlock any reward for this badge yet. Start now!" />
                  </ListItem>
               )}
            </List>
         </AccordionDetails>
      </Accordion>
   )
}

const RequirementsForABadge = ({ badge }: { badge: Badge }) => {
   const { userStats } = useAuth()
   return (
      <List disablePadding>
         {badge.requirements.map((requirement, index) => (
            <LevelInformationPopupListItem
               key={`context_reward_${index}`}
               description={requirement.description}
               isComplete={requirement.isComplete(userStats)}
            />
         ))}
      </List>
   )
}

export default CareerSkills
