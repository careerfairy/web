import {
   CustomJobApplicationSource,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   Button,
   CircularProgress,
   Stack,
   SxProps,
   Typography,
} from "@mui/material"
import Box from "@mui/material/Box"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback, useEffect } from "react"
import { HelpCircle } from "react-feather"
import { useDispatch } from "react-redux"
import {
   AutomaticActions,
   setAutoAction,
   setJobToOpen,
} from "store/reducers/sparksFeedReducer"
import { combineStyles, sxStyles } from "../../../../../types/commonTypes"
import useCustomJobApply from "../../../../custom-hook/custom-job/useCustomJobApply"

const styles = sxStyles({
   confirmationWrapper: {
      position: "sticky",
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      bottom: 0,
      padding: "24px",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: "12px",
      border: (theme) => `1.5px solid ${theme.palette.primary.main}`,
      background: "white",
      boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.05)",
   },
   noBtn: {
      color: "neutral.200",
   },
   yesBtn: {
      whiteSpace: "nowrap",
      fontWeight: 600,
   },
   info: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      alignItems: "center",
      textAlign: { xs: "center", md: "unset" },

      "& svg": {
         color: (theme) => theme.palette.primary.main,
      },
   },
   btn: {
      textTransform: "none",
      height: "40px",
      padding: "12px 30px",
   },
   message: {
      display: "flex",
      flexDirection: "column",
      mt: { xs: 1, md: "unset" },
      mb: { xs: 2, md: "unset" },
      gap: "2px",
   },
   messageText: {
      ml: 2,
      fontWeight: 400,
   },
   messageTextBold: {
      fontWeight: 600,
      ml: 0.5,
   },
})

type Props = {
   handleClose: () => void
   job: PublicCustomJob
   applicationSource: CustomJobApplicationSource
   autoApply?: boolean
   sx?: SxProps
   onApply?: () => void
}

const CustomJobApplyConfirmation = ({
   handleClose,
   job,
   applicationSource,
   autoApply,
   onApply,
   sx,
}: Props) => {
   const { isLoggedIn, userData } = useAuth()
   const dispatch = useDispatch()
   const { handleConfirmApply, alreadyApplied, isApplying, redirectToSignUp } =
      useCustomJobApply(job, applicationSource)

   const handleRedirectClick = useCallback(() => {
      dispatch(setJobToOpen(job.id))
      dispatch(setAutoAction(AutomaticActions.APPLY))
      redirectToSignUp()
   }, [job, dispatch, redirectToSignUp])

   const handleClick = useCallback(async () => {
      await handleConfirmApply()
      onApply && onApply()

      !isLoggedIn && handleRedirectClick()
   }, [onApply, handleConfirmApply, handleRedirectClick, isLoggedIn])

   useEffect(() => {
      if (userData?.id && autoApply && !alreadyApplied) {
         handleClick()
         dispatch(setJobToOpen(null))
         dispatch(setAutoAction(null))
      }
   }, [autoApply, dispatch, handleClick, userData, alreadyApplied])

   return alreadyApplied ? null : (
      <Component
         job={job}
         handleClose={handleClose}
         handleClick={handleClick}
         isApplying={isApplying}
         isLoggedIn={isLoggedIn}
         sx={sx}
      />
   )
}

type ComponentProps = {
   job: PublicCustomJob
   handleClose: () => void
   handleClick: () => void
   isApplying: boolean
   isLoggedIn: boolean
   sx?: SxProps
}
const Component = ({
   job,
   handleClose,
   handleClick,
   isApplying,
   isLoggedIn,
   sx,
}: ComponentProps) => {
   return (
      <Box sx={combineStyles(styles.confirmationWrapper, sx)}>
         <Box sx={styles.info}>
            <HelpCircle size={28} />
            <Box sx={styles.message}>
               <Typography variant={"h6"} sx={styles.messageText}>
                  Did you apply to
                  <Box component="span" sx={styles.messageTextBold}>
                     {job.title}
                  </Box>
                  ?
               </Typography>
               <Typography variant={"body2"} sx={styles.messageText}>
                  {isLoggedIn
                     ? "Check your profile to manage your applications."
                     : "Create an account to manage your jobs directly on CareerFairy."}
               </Typography>
            </Box>
         </Box>

         <Stack direction="row" flexWrap="nowrap">
            <Button
               sx={[styles.btn, styles.noBtn]}
               variant="text"
               onClick={handleClose}
            >
               No
            </Button>

            <Button
               sx={[styles.btn, styles.yesBtn]}
               variant="text"
               color="primary"
               onClick={handleClick}
               disabled={isApplying}
               startIcon={
                  isApplying ? (
                     <CircularProgress size={20} color="inherit" />
                  ) : null
               }
            >
               {isLoggedIn ? "Yes" : "Yes, sign up"}
            </Button>
         </Stack>
      </Box>
   )
}
export default CustomJobApplyConfirmation
