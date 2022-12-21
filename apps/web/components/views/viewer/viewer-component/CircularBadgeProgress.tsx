import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import Typography from "@mui/material/Typography"
import Tooltip from "@mui/material/Tooltip"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"

import React, { memo, useCallback, useState } from "react"
import { alpha } from "@mui/material/styles"
import CircularProgress, {
   circularProgressClasses,
} from "@mui/material/CircularProgress"

import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import { sxStyles } from "../../../../types/commonTypes"
import Link from "../../common/Link"

import useBadgeStepProgress from "../../../custom-hook/useBadgeStepProgress"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import { UserLivestreamData } from "@careerfairy/shared-lib/dist/livestreams"

import useAnimatedNumber from "../../../custom-hook/useAnimatedNumber"
import useIsMobile from "../../../custom-hook/useIsMobile"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { useTimeoutFn } from "react-use"

const styles = sxStyles({
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
   label: string
   badge: Badge

   helperText?: string
   initialSnapshot?: UserLivestreamData["participated"]["initialSnapshot"]
}

const delay = 1000
const CircularBadgeProgress = ({
   label,
   badge,
   helperText,
   initialSnapshot,
}: ProgressProps) => {
   const isMobile = useIsMobile()

   const { userPresenter, userStats } = useAuth()

   const { percentProgress, activeStep } = useBadgeStepProgress(
      badge,
      userStats,
      userPresenter
   )

   const { percentProgress: initialPercentProgress } = useBadgeStepProgress(
      badge,
      initialSnapshot.userStats,
      initialSnapshot.userData
         ? new UserPresenter(initialSnapshot.userData)
         : null
   )
   const [progressValue, setProgressValue] = useState(initialPercentProgress)

   const updateProgress = useCallback(() => {
      setProgressValue(percentProgress)
   }, [percentProgress])

   useTimeoutFn(updateProgress, delay) // call updateProgress after delay on mount

   const animatedProgressValue = useAnimatedNumber(progressValue, 500)

   const size = isMobile ? 64 : 90
   const thickness = isMobile ? 4 : 5

   return (
      <Stack justifyContent={"center"} alignItems={"center"}>
         <Box component={Link} href={"/profile/career-skills"} sx={styles.root}>
            <CircularProgress
               variant="determinate"
               sx={styles.backgroundCircle}
               size={size}
               thickness={thickness}
               value={100}
            />
            <CircularProgress
               value={animatedProgressValue}
               color={"secondary"}
               variant="determinate"
               thickness={thickness}
               size={size}
               sx={styles.progressCircle}
            />
            <Box sx={styles.middleTextWrapper}>
               <Typography
                  sx={[styles.middleText, isMobile && styles.middleTextMobile]}
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
            sx={[styles.bottomText, isMobile && styles.bottomTextMobile]}
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

export default memo(CircularBadgeProgress) // Memoize to prevent re-rendering due to useTween hook animation
