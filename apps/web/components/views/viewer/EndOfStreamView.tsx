import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import Tooltip from "@mui/material/Tooltip"
import Divider from "@mui/material/Divider"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import React from "react"
import CircularProgress, {
   circularProgressClasses,
} from "@mui/material/CircularProgress"

import { ResearchBadge } from "@careerfairy/shared-lib/dist/badges/ResearchBadges"
import { NetworkerBadge } from "@careerfairy/shared-lib/dist/badges/NetworkBadges"
import { EngageBadge } from "@careerfairy/shared-lib/dist/badges/EngageBadges"
import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import { alpha } from "@mui/material/styles"

import { sxStyles } from "../../../types/commonTypes"
import { getBaseUrl } from "../../helperFunctions/HelperFunctions"

import useBadgeStepProgress from "../../custom-hook/useBadgeStepProgress"
import useIsMobile from "../../custom-hook/useIsMobile"
import { useCurrentStream } from "../../../context/stream/StreamContext"
import { useAuth } from "../../../HOCs/AuthProvider"

import RecommendedEvents from "../portal/events-preview/RecommendedEvents"
import ShareLinkButton from "../common/ShareLinkButton"
import Link from "../common/Link"

const styles = sxStyles({
   root: {
      bgcolor: "background.paper",
      py: 2,
      height: "inherit",
      alignItems: "center",
      overflow: "auto",
      width: "100%",
   },
   divider: {
      width: 150,
      mx: "auto !important",
      borderWidth: 1,
   },
   ctas: {
      display: "inline-flex",
      justifyContent: "center",
   },
   container: {
      height: "inherit",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
   },
   stack: { width: "100%" },
})

const getLinkUrl = (streamId: string) =>
   `${getBaseUrl()}/upcoming-livestream/${streamId}?utm_source=end_of_stream&utm_medium=share`

const EndOfStreamView = () => {
   const { currentLivestream } = useCurrentStream()

   const { userPresenter } = useAuth()

   return (
      <Box sx={styles.root}>
         <Container sx={styles.container}>
            <Stack
               spacing={{
                  xs: 2,
                  sm: 4,
               }}
               justifyContent={"space-between"}
               sx={styles.stack}
            >
               <Typography align={"center"}>Thanks for watching!</Typography>
               {currentLivestream.title && (
                  <Typography
                     variant={"h4"}
                     fontWeight={"bolder"}
                     align={"center"}
                  >
                     {currentLivestream.title}
                  </Typography>
               )}
               {userPresenter && (
                  <>
                     <Typography align={"center"}>
                        Congrats! You are one step closer to land the job you’ll
                        love 🚀
                     </Typography>
                     <Stack
                        direction={"row"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        spacing={{
                           xs: 2,
                           sm: 5,
                        }}
                     >
                        <CircularBadgeProgress
                           badge={ResearchBadge}
                           label={"Research"}
                           helperText={
                              "The more you progress through these levels, the more exclusive content you'll have access to."
                           }
                        />
                        <CircularBadgeProgress
                           badge={NetworkerBadge}
                           helperText={
                              "The more you progress through these levels, the easier it will be for you to increase your network."
                           }
                           label={"Network"}
                        />
                        <CircularBadgeProgress
                           label={"Engagement"}
                           badge={EngageBadge}
                           helperText={
                              "The more you progress through these levels, the easier it will be for you to engage with company recruiters."
                           }
                        />
                     </Stack>
                  </>
               )}

               <Divider sx={styles.divider} variant="middle" />
               <Typography variant={"h6"} align={"center"}>
                  Recommended livestreams for you
               </Typography>
               <Box>
                  <RecommendedEvents hideTitle />
               </Box>
               <Stack
                  alignItems={"center"}
                  spacing={2}
                  justifyContent={"center"}
               >
                  <Button
                     component={Link}
                     size={"large"}
                     href={"/portal"}
                     variant={"contained"}
                  >
                     SEE MORE LIVE STREAMS
                  </Button>
                  <ShareLinkButton
                     size={"large"}
                     linkUrl={getLinkUrl(currentLivestream.id)}
                  />
               </Stack>
            </Stack>
         </Container>
      </Box>
   )
}

const progressStyles = sxStyles({
   root: {
      position: "relative",
      display: "inline-flex",
      textDecoration: "none",
      color: "inherit",
   },
   middleTextWrapper: {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      position: "absolute",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   middleText: {
      fontSize: "1.1rem",
   },
   middleTextMobile: {
      fontSize: "0.9rem",
   },
   backgroundCircle: {
      color: (theme) =>
         alpha(
            theme.palette.secondary.main,
            theme.palette.mode === "light" ? 0.1 : 0.3
         ),
   },
   progressCircle: {
      position: "absolute",
      left: 0,
      [`& .${circularProgressClasses.circle}`]: {
         strokeLinecap: "round",
      },
   },
   bottomText: {
      fontSize: "1.125rem",
      display: "flex",
      alignItems: "center",
      "& > *": {
         ml: 0.5,
      },
   },
   bottomTextMobile: {
      fontSize: "0.9rem",
   },
})

type ProgressProps = {
   label?: string
   badge: Badge

   helperText?: string
}
const CircularBadgeProgress = ({
   label = "Research",
   badge,
   helperText,
}: ProgressProps) => {
   const { userPresenter } = useAuth()

   const isMobile = useIsMobile()

   const { percentProgress, activeStep } = useBadgeStepProgress(
      userPresenter,
      badge
   )

   const size = isMobile ? 64 : 90
   const thickness = isMobile ? 4 : 5

   return (
      <Stack justifyContent={"center"} alignItems={"center"}>
         <Box
            component={Link}
            href={"/profile/career-skills"}
            sx={progressStyles.root}
         >
            <CircularProgress
               variant="determinate"
               sx={progressStyles.backgroundCircle}
               size={size}
               thickness={thickness}
               value={100}
            />
            <CircularProgress
               color={"secondary"}
               variant="determinate"
               thickness={thickness}
               size={size}
               sx={progressStyles.progressCircle}
               value={percentProgress}
            />
            <Box sx={progressStyles.middleTextWrapper}>
               <Typography
                  sx={[
                     progressStyles.middleText,
                     isMobile && progressStyles.middleTextMobile,
                  ]}
                  component="div"
                  fontWeight={"bold"}
               >
                  {`Level ${activeStep}`}
               </Typography>
            </Box>
         </Box>
         <Typography
            fontWeight={"bold"}
            variant={"h6"}
            sx={[
               progressStyles.bottomText,
               isMobile && progressStyles.bottomTextMobile,
            ]}
            align={"center"}
         >
            {label}
            <Tooltip title={helperText}>
               <InfoOutlinedIcon />
            </Tooltip>
         </Typography>
      </Stack>
   )
}

export default EndOfStreamView
