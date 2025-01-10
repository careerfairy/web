import { IUserReminder, UserReminderType } from "@careerfairy/shared-lib/users"
import { Box, Button, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { userRepo } from "../../../../data/RepositoryInstances"
import { PillsBackground } from "../../../../materialUI/GlobalBackground/GlobalBackGround"
import { sxStyles } from "../../../../types/commonTypes"
import { dataLayerEvent } from "../../../../util/analyticsUtils"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import Link from "../../common/Link"
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
   const { userData, isLoggedIn } = useAuth()
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
      <PillsBackground
         styles={styles.wrapper}
         isSmallBackground={true}
         bgColor={"#EFF5F8"}
      >
         <Box sx={styles.content}>
            <Typography variant={"h3"} fontWeight={"600"} color="black">
               Stay up-to-date. Always.
            </Typography>
            <Typography
               variant={"h6"}
               fontWeight={"400"}
               color="textSecondary"
               mt={2}
               textAlign="center"
               mx={1}
            >
               {isLoggedIn
                  ? "Sign up for our weekly update and receive personalised invitations to career live streams and job openings"
                  : "Create an account to receive personalised invitations to career live streams and job openings"}
            </Typography>
            <Box mt={4}>
               {isLoggedIn ? (
                  <Button
                     onClick={handleAcceptNewsletter}
                     variant={"contained"}
                     color={"secondary"}
                     size={"large"}
                  >
                     SIGN ME UP
                  </Button>
               ) : (
                  <Link
                     noLinkStyle
                     href={{
                        pathname: "/signup",
                        query: {
                           absolutePath: asPath,
                        },
                     }}
                  >
                     <Button
                        variant={"contained"}
                        color={"secondary"}
                        size={"large"}
                     >
                        Join CareerFairy
                     </Button>
                  </Link>
               )}
            </Box>
         </Box>
      </PillsBackground>
   )
}

export default NewsletterSection
