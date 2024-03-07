import { sxStyles } from "../../../../../../types/commonTypes"
import Box from "@mui/material/Box"
import React, { useCallback, useEffect } from "react"
import { HelpCircle } from "react-feather"
import { Button, CircularProgress, Stack, Typography } from "@mui/material"
import useCustomJobApply from "../../../../../custom-hook/custom-job/useCustomJobApply"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useLiveStreamDialog } from "../../../LivestreamDialog"
import { useAuth } from "HOCs/AuthProvider"
import { useDispatch } from "react-redux"
import {
   AutomaticActions,
   setAutoAction,
   setJobToOpen,
} from "store/reducers/sparksFeedReducer"

const styles = sxStyles({
   confirmationWrapper: {
      position: "sticky",
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      bottom: "100px",
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
   livestreamId: string
   autoApply: boolean
}
const CustomJobApplyConfirmation = ({
   handleClose,
   job,
   livestreamId,
   autoApply,
}: Props) => {
   const { isLoggedIn, userData } = useAuth()
   const { goToView } = useLiveStreamDialog()
   const dispatch = useDispatch()
   const { handleApply, alreadyApplied, isApplying, redirectToSignUp } =
      useCustomJobApply(job, livestreamId)

   const handleClick = useCallback(async () => {
      if (userData?.id) {
         await handleApply()
         goToView("livestream-details")
      }
   }, [goToView, handleApply, userData])

   const handleRedirectClick = () => {
      dispatch(setJobToOpen(job.id))
      dispatch(setAutoAction(AutomaticActions.APPLY))
      redirectToSignUp()
   }

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
         handleClick={isLoggedIn ? handleClick : handleRedirectClick}
         isApplying={isApplying}
         isLoggedIn={isLoggedIn}
      />
   )
}

type ComponentProps = {
   job: PublicCustomJob
   handleClose: () => void
   handleClick: () => void
   isApplying: boolean
   isLoggedIn: boolean
}
const Component = ({
   job,
   handleClose,
   handleClick,
   isApplying,
   isLoggedIn,
}: ComponentProps) => {
   return (
      <Box sx={styles.confirmationWrapper}>
         <Box sx={styles.info}>
            <HelpCircle size={28} />
            <Box sx={styles.message}>
               <Typography variant={"h6"} sx={styles.messageText}>
                  Did you apply to
                  <Box component="span" sx={styles.messageTextBold}>
                     {job.title} ?
                  </Box>
               </Typography>
               <Typography variant={"body2"} sx={styles.messageText}>
                  {isLoggedIn
                     ? "You'll soon be able to manage your jobs directly in your profile."
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
