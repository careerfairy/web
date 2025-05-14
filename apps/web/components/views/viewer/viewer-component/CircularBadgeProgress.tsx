import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"

import CircularProgress, {
   circularProgressClasses,
} from "@mui/material/CircularProgress"
import { alpha } from "@mui/material/styles"
import { memo, useCallback, useState } from "react"

import { Badge } from "@careerfairy/shared-lib/badges/badges"
import { sxStyles } from "../../../../types/commonTypes"
import Link from "../../common/Link"

import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import UserPresenter from "@careerfairy/shared-lib/users/UserPresenter"
import useBadgeStepProgress from "../../../custom-hook/useBadgeStepProgress"

import { useTimeoutFn } from "react-use"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useAnimatedNumber from "../../../custom-hook/useAnimatedNumber"
import useIsMobile from "../../../custom-hook/useIsMobile"

const styles = sxStyles({
   root: {
      width: {
         xs: 100,
         sm: 120,
      },
   },
   progress: {
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

   const { percentProgress, currentBadgeLevel } = useBadgeStepProgress(
      badge,
      userStats,
      userPresenter
   )

   const { percentProgress: initialPercentProgress } = useBadgeStepProgress(
      badge,
      initialSnapshot?.userStats,
      initialSnapshot?.userData
         ? new UserPresenter(initialSnapshot.userData)
         : null
   )
   const [progressValue, setProgressValue] = useState(initialPercentProgress)

   const updateProgress = useCallback(() => {
      setProgressValue(percentProgress)
   }, [percentProgress])

   useTimeoutFn(updateProgress, delay) // call updateProgress after delay on mount

   const animatedProgressValue = useAnimatedNumber(progressValue, 100)

   const size = isMobile ? 64 : 90
   const thickness = 4

   return (
      <Stack sx={styles.root} justifyContent={"center"} alignItems={"center"}>
         <Box
            component={Link}
            href={"/profile/career-skills"}
            sx={styles.progress}
         >
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
                  {`Level ${currentBadgeLevel}`}
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

export default memo(CircularBadgeProgress) // Memoize to prevent re-rendering due to useAnimatedNumber hook causing re-renders
