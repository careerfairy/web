import {
   Button,
   Grid,
   Slide,
   Snackbar,
   SnackbarContent,
   Typography,
} from "@mui/material"
import React, { useCallback, useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import useIsMobile from "../../custom-hook/useIsMobile"
import { sxStyles } from "../../../types/commonTypes"
import { userRepo } from "../../../data/RepositoryInstances"
import { useAuth } from "../../../HOCs/AuthProvider"
import {
   IUserReminder,
   UserReminderType,
} from "@careerfairy/shared-lib/dist/users"
import CircularProgress from "@mui/material/CircularProgress"
import { sendGeneralError } from "../../../store/actions"
import { useDispatch } from "react-redux"
import { dataLayerEvent } from "../../../util/analyticsUtils"

const styles = sxStyles({
   closeBtnWrapper: {
      display: "flex",
      justifyContent: "end",
   },
   message: {
      fontWeight: 400,
   },
   subMessage: {
      color: "black",
      mt: 2,
      fontWeight: 500,
   },
   buttonsWrapper: {
      mt: 3,
      display: "flex",
      alignItems: "center",
   },
   noButton: {
      cursor: "pointer",
      color: "black",
      fontWeight: 400,
      width: "fit-content",
   },
   root: {
      color: ["text.primary", "!important"],
   },
})

type Props = {
   isFirstReminder: boolean
}

const TransitionDown = (props) => <Slide {...props} direction="up" />

const NewsletterSnackbar = ({ isFirstReminder }: Props): JSX.Element => {
   const { userData } = useAuth()
   const [open, setOpen] = useState(true)
   const [isSubmitting, setIsSubmitting] = useState(false)
   const isMobile = useIsMobile()
   const dispatch = useDispatch()

   const handleAcceptNewsletter = useCallback(async () => {
      setIsSubmitting(true)
      dataLayerEvent(
         `newsletter_accepted_on_${
            isFirstReminder ? "1st_reminder" : "2nd_reminder"
         }`
      )
      try {
         // If it was accepted we should set it as completed
         const reminder = {
            complete: true,
            isFirstReminder: isFirstReminder,
            type: UserReminderType.NewsletterReminder,
         } as IUserReminder

         await userRepo.updateUserReminder(userData.id, reminder)
         await userRepo.updateAdditionalInformation(userData.id, {
            unsubscribed: false,
         })

         setOpen(false)
      } catch (e) {
         dispatch(sendGeneralError(e))
      } finally {
         setIsSubmitting(false)
      }
   }, [dispatch, isFirstReminder, userData?.id])

   const handleDeclineNewsletter = useCallback(async () => {
      dataLayerEvent(
         `newsletter_denied_on_${
            isFirstReminder ? "1st_reminder" : "2nd_reminder"
         }`
      )

      try {
         // If this is the first reminder, we should wait another 15 days for the next reminder
         if (isFirstReminder) {
            const thirtyDaysFromNow = new Date(
               new Date().setDate(new Date().getDate() + 15)
            )

            const reminder = {
               complete: false,
               type: UserReminderType.NewsletterReminder,
               notBeforeThan: thirtyDaysFromNow,
               isFirstReminder: false,
            } as IUserReminder

            await userRepo.updateUserReminder(userData.id, reminder)
            setOpen(false)
         } else {
            // If this is not the first reminder and is declined, we should be set it as completed
            const reminder = {
               complete: true,
               type: UserReminderType.NewsletterReminder,
            } as IUserReminder

            await userRepo.updateUserReminder(userData.id, reminder)
            setOpen(false)
         }
      } catch (e) {
         dispatch(sendGeneralError(e))
      }
   }, [dispatch, isFirstReminder, userData?.id])

   return (
      <Snackbar
         anchorOrigin={{
            vertical: "bottom",
            horizontal: isMobile ? "center" : "right",
         }}
         open={open}
         TransitionComponent={TransitionDown}
         key={"newsletter"}
         sx={isMobile && { left: 26, right: 26, bottom: 36 }}
      >
         <SnackbarContent
            style={{ backgroundColor: "white" }}
            message={
               <Grid
                  sx={styles.root}
                  container
                  maxWidth={isMobile ? "inherit" : "350px"}
               >
                  <Grid xs={12} item sx={styles.closeBtnWrapper}>
                     <IconButton
                        aria-label="close"
                        color="default"
                        onClick={handleDeclineNewsletter}
                        size="small"
                     >
                        <CloseIcon />
                     </IconButton>
                  </Grid>
                  <Grid xs={11} item>
                     <Grid xs={12} item>
                        {isFirstReminder ? (
                           <Typography variant="h6" sx={styles.message}>
                              Sure you want to miss our <b>relevant tips</b> for
                              your career?
                           </Typography>
                        ) : (
                           <Typography variant="h6" sx={styles.message}>
                              Oh 😣 <br /> <br />
                              You just missed an event you may have liked. This
                              is the last chance you have to stay up-to-date.
                           </Typography>
                        )}

                        <Typography variant="h6" sx={styles.subMessage}>
                           {isMobile
                              ? "Subscribe to our tips"
                              : "Subscribe to our newsletter"}
                        </Typography>
                     </Grid>
                     <Grid xs={12} item sx={styles.buttonsWrapper}>
                        <Grid
                           xs={8}
                           display="flex"
                           justifyContent={isFirstReminder ? "start" : "end"}
                           item
                        >
                           <Typography
                              sx={styles.noButton}
                              variant="h6"
                              onClick={handleDeclineNewsletter}
                           >
                              {isFirstReminder ? "Remind me later" : "No"}
                           </Typography>
                        </Grid>
                        <Grid xs={4} display="flex" justifyContent="end" item>
                           <Button
                              onClick={handleAcceptNewsletter}
                              variant="contained"
                              color="secondary"
                              size="large"
                              sx={{ py: 1 }}
                              startIcon={
                                 isSubmitting && (
                                    <CircularProgress
                                       color={"inherit"}
                                       size={15}
                                    />
                                 )
                              }
                           >
                              Yes
                           </Button>
                        </Grid>
                     </Grid>
                  </Grid>
               </Grid>
            }
         />
      </Snackbar>
   )
}

export default NewsletterSnackbar
