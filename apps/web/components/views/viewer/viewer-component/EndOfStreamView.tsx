<<<<<<<< HEAD:apps/web/components/views/viewer/EndOfStreamView.tsx
import React from "react"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../types/commonTypes"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import Container from "@mui/material/Container"
import { CircularProgressProps, Divider, Tooltip } from "@mui/material"
import CircularProgress, {
   circularProgressClasses,
} from "@mui/material/CircularProgress"
import { lighten } from "@mui/system/colorManipulator"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import RecommendedEvents from "../portal/events-preview/RecommendedEvents"
import Button from "@mui/material/Button"
import Link from "../common/Link"
import ShareLinkButton from "../common/ShareLinkButton"
import { getBaseUrl } from "../../helperFunctions/HelperFunctions"

const styles = sxStyles({
   root: {
      bgcolor: "background.paper",
========
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import Divider from "@mui/material/Divider"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import React from "react"

import { ResearchBadge } from "@careerfairy/shared-lib/dist/badges/ResearchBadges"
import { NetworkerBadge } from "@careerfairy/shared-lib/dist/badges/NetworkBadges"
import { EngageBadge } from "@careerfairy/shared-lib/dist/badges/EngageBadges"

import { sxStyles } from "../../../../types/commonTypes"
import { useCurrentStream } from "../../../../context/stream/StreamContext"
import { useAuth } from "../../../../HOCs/AuthProvider"

import RecommendedEvents from "../../portal/events-preview/RecommendedEvents"
import ShareLinkButton from "../../common/ShareLinkButton"
import Link from "../../common/Link"
import { CircularBadgeProgress } from "./CircularBadgeProgress"
import { getBaseUrl } from "../../../helperFunctions/HelperFunctions"

const styles = sxStyles({
   root: {
      bgcolor: "background.default",
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
>>>>>>>> 4059b8611 (separated end of stream component into smaller files,):apps/web/components/views/viewer/viewer-component/EndOfStreamView.tsx
   },
   divider: { width: 200, mx: "auto !important", borderWidth: 1 },
   ctas: {
      display: "inline-flex",
      justifyContent: "center",
   },
})

<<<<<<<< HEAD:apps/web/components/views/viewer/EndOfStreamView.tsx
const EndOfStreamView = (props: LivestreamEvent) => {
   return (
      <Container sx={styles.root}>
         <Stack spacing={2} justifyContent={"center"}>
            <Typography variant={"h5"} align={"center"}>
               Thanks for watching!
            </Typography>
            <Typography variant={"h3"} align={"center"}>
               {props.title}
            </Typography>
            <Typography align={"center"}>
               Congrats! You are one step closer to land the job you’ll love 🚀
            </Typography>
            <Stack direction={"row"} justifyContent={"center"} spacing={2}>
               <CircularProgressWithLabel
                  value={66}
                  middleText={"Level 2"}
                  bottomText={"Research"}
               />
               <CircularProgressWithLabel
                  value={33}
                  middleText={"Level 1"}
                  bottomText={"Network"}
               />
               <CircularProgressWithLabel
                  value={100}
                  bottomText={"Engagement"}
                  middleText={"Level 3"}
               />
========
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
               <Box>
                  <Typography variant={"h6"} align={"center"}>
                     Recommended livestreams for you
                  </Typography>
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
>>>>>>>> 4059b8611 (separated end of stream component into smaller files,):apps/web/components/views/viewer/viewer-component/EndOfStreamView.tsx
            </Stack>
            <Divider sx={styles.divider} variant="middle" />
            <Typography variant={"h6"} align={"center"}>
               Recommended livestreams for you
            </Typography>
            <RecommendedEvents hideTitle />
            <Stack alignItems={"center"} spacing={2} justifyContent={"center"}>
               <Button component={Link} href={"/portal"} variant={"contained"}>
                  SEE MORE LIVE STREAMS
               </Button>
               <ShareLinkButton
                  linkUrl={`${getBaseUrl()}/upcoming-livestream/${
                     props.id
                  }?utm_source=end_of_stream&utm_medium=share`}
               />
            </Stack>
         </Stack>
      </Container>
   )
}

<<<<<<<< HEAD:apps/web/components/views/viewer/EndOfStreamView.tsx
const progressStyles = sxStyles({
   root: {},
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
   backgroundCircle: {
      color: (theme) =>
         lighten(
            theme.palette.secondary.main,
            theme.palette.mode === "light" ? 0.9 : 0.2
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
      display: "flex",
      alignItems: "center",
      "& > *": {
         ml: 0.5,
      },
   },
})

type ProgressProps = {
   middleText?: string
   bottomText?: string
   bottomTextTooltip?: string
   value: CircularProgressProps["value"]
   size?: CircularProgressProps["size"]
   thickness?: CircularProgressProps["thickness"]
}
const CircularProgressWithLabel = ({
   size = 80,
   thickness = 5,
   value,
   middleText = "Level 2",
   bottomText = "Research",
   bottomTextTooltip = "Lorem ispum dolor sit amet",
}: ProgressProps) => {
   return (
      <Stack justifyContent={"center"} alignItems={"center"}>
         <Box sx={{ position: "relative", display: "inline-flex" }}>
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
               value={value}
            />
            <Box sx={progressStyles.middleTextWrapper}>
               <Typography component="div" fontWeight={"bold"}>
                  {middleText}
               </Typography>
            </Box>
         </Box>
         <Typography
            fontWeight={"bold"}
            variant={"h6"}
            sx={progressStyles.bottomText}
            align={"center"}
         >
            {bottomText}
            <Tooltip title={bottomTextTooltip}>
               <InfoOutlinedIcon />
            </Tooltip>
         </Typography>
      </Stack>
   )
}

========
const getLinkUrl = (streamId: string) =>
   `${getBaseUrl()}/upcoming-livestream/${streamId}?utm_source=end_of_stream&utm_medium=share`
>>>>>>>> 4059b8611 (separated end of stream component into smaller files,):apps/web/components/views/viewer/viewer-component/EndOfStreamView.tsx
export default EndOfStreamView
