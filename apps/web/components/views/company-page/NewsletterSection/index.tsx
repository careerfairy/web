import { Box, Button, Typography } from "@mui/material"
import React, { useCallback } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import { useAuth } from "../../../../HOCs/AuthProvider"
import Link from "../../common/Link"
import { useRouter } from "next/router"
import { dataLayerEvent } from "../../../../util/analyticsUtils"
import { userRepo } from "../../../../data/RepositoryInstances"
import { IUserReminder, UserReminderType } from "@careerfairy/shared-lib/users"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import { PillsBackground } from "../../../../materialUI/GlobalBackground/GlobalBackGround"
import { useCompanyPage } from "../index"

const styles = sxStyles({
   wrapper: {
      height: "320px",
      minHeight: "fit-content",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      mt: 12,
   },
   content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
})

const NewsletterSection = () => {
   const { userData, isLoggedIn, isLoggedOut } = useAuth()
   const { editMode } = useCompanyPage()
   const { asPath } = useRouter()
   const { errorNotification } = useSnackbarNotifications()

   const handleAcceptNewsletter = useCallback(async () => {
      dataLayerEvent(`newsletter_accepted_on_company_page`)
      try {
         // If it was accepted we should set it as completed
         const reminder: IUserReminder = {
            complete: true,
            type: UserReminderType.NewsletterReminder,
         }

         await Promise.allSettled([
            userRepo.updateUserReminder(userData?.id, reminder),
            userRepo.updateAdditionalInformation(userData?.id, {
               unsubscribed: false,
            }),
         ])
      } catch (e) {
         errorNotification(e.message)
      }
   }, [errorNotification, userData?.id])

   if (editMode || (isLoggedIn && !userData?.unsubscribed)) {
      return null
   }

   return (
      <PillsBackground styles={styles.wrapper} isSmallBackground={true}>
         <Box sx={styles.content}>
            <Typography variant={"h3"} fontWeight={"600"} color="black">
               Stay up-to-date. Always.
            </Typography>
            <Typography
               variant={"h6"}
               fontWeight={"400"}
               color="textSecondary"
               mt={2}
            >
               {isLoggedOut
                  ? "Create an account to receive personalised invitations to career live streams and job openings"
                  : "Sign up for our weekly update and receive personalised invitations to career live streams and job openings"}
            </Typography>
            <Box mt={4}>
               {isLoggedOut ? (
                  <Button
                     component={Link}
                     // @ts-ignore
                     href={{
                        pathname: "/signup",
                        query: {
                           absolutePath: asPath,
                        },
                     }}
                     variant={"contained"}
                     color={"secondary"}
                     size={"large"}
                  >
                     Join CareerFairy
                  </Button>
               ) : (
                  <Button
                     onClick={handleAcceptNewsletter}
                     variant={"contained"}
                     color={"secondary"}
                     size={"large"}
                  >
                     SIGN ME UP
                  </Button>
               )}
            </Box>
         </Box>
      </PillsBackground>
   )
}

export default NewsletterSection
