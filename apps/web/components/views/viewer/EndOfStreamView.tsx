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
   },
   divider: { width: 200, mx: "auto !important", borderWidth: 1 },
   ctas: {
      display: "inline-flex",
      justifyContent: "center",
   },
})

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

export default EndOfStreamView
