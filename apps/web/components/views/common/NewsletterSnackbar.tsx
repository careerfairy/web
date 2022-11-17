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

const styles = sxStyles({
   closeBtnWrapper: {
      display: "flex",
      justifyContent: "end",
   },
   message: {
      color: "black",
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
})

type Props = {
   isFinalReminder: boolean
}

const TransitionDown = (props) => <Slide {...props} direction="up" />

const NewsletterSnackbar = ({ isFinalReminder }: Props): JSX.Element => {
   const { userData } = useAuth()
   const [open, setOpen] = useState(true)
   const [isSubmitting, setIsSubmitting] = useState(false)
   const isMobile = useIsMobile()

   const handleAcceptNewsletter = useCallback(async () => {
      setIsSubmitting(true)

      try {
         // If it was accepted we should remove the reminder from the DB and update unsubscribed the user data
         await userRepo.removeUserReminder(
            userData.id,
            UserReminderType.NewsletterReminder
         )
         await userRepo.updateAdditionalInformation(userData.id, {
            unsubscribed: false,
         })

         setOpen(false)
      } catch (e) {
         console.log("error", e)
      } finally {
         setIsSubmitting(false)
      }
   }, [userData?.id])

   const handleDeclineNewsletter = useCallback(async () => {
      setIsSubmitting(true)

      try {
         // If this is the final reminder and is declined, we should be removed it to not display this reminder again
         if (isFinalReminder) {
            await userRepo.removeUserReminder(
               userData.id,
               UserReminderType.NewsletterReminder
            )
            setOpen(false)
            return
         }

         // If this is not the final reminder, we should wait another 30 days for the next reminder
         const thirtyDaysFromNow = new Date(
            new Date().setDate(new Date().getDate() + 30)
         )

         const notification = {
            complete: false,
            type: UserReminderType.NewsletterReminder,
            notBeforeThan: thirtyDaysFromNow,
            isFinalReminder: true,
         } as IUserReminder

         await userRepo.updateUserReminder(userData.id, notification)
         setOpen(false)
      } catch (e) {
         console.log("error", e)
      } finally {
         setIsSubmitting(false)
      }
   }, [isFinalReminder, userData?.id])

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
               <Grid container maxWidth={isMobile ? "inherit" : "350px"}>
                  <Grid xs={12} item sx={styles.closeBtnWrapper}>
                     <IconButton
                        aria-label="close"
                        color="default"
                        onClick={() => setOpen(false)}
                        size="small"
                     >
                        <CloseIcon />
                     </IconButton>
                  </Grid>
                  <Grid xs={11} item>
                     <Grid xs={12} item>
                        {isFinalReminder ? (
                           <Typography variant="h6" sx={styles.message}>
                              Oh 😣 <br /> <br />
                              You just missed an event you may have liked. This
                              is the last chance you have to stay up-to-date.
                           </Typography>
                        ) : (
                           <Typography variant="h6" sx={styles.message}>
                              Sure you want to miss our <b>relevant tips</b> for
                              your career?
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
                           justifyContent={isFinalReminder ? "end" : "start"}
                           item
                        >
                           <Typography
                              sx={styles.noButton}
                              variant="h6"
                              onClick={handleDeclineNewsletter}
                           >
                              {isFinalReminder ? "No" : "Remind me later"}
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
