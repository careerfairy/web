import { IUserReminder, UserReminderType } from "@careerfairy/shared-lib/users"
import { Box, Button, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { AnalyticsEvents } from "util/analyticsConstants"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { userRepo } from "../../../../data/RepositoryInstances"
import { PillsBackground } from "../../../../materialUI/GlobalBackground/GlobalBackGround"
import { sxStyles } from "../../../../types/commonTypes"
import { dataLayerCompanyEvent } from "../../../../util/analyticsUtils"
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
      mt: {
         xs: "12px",
         sm: "12px",
         md: "16px",
      },
      borderRadius: "12px",
      backgroundPosition: {
         xs: "-270px -120px",
         md: "-320px -120px",
      },
      backgroundSize: {
         xs: "400px !important",
         md: "70dvh !important",
      },
   },
   content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      maxWidth: {
         xs: "80%",
         md: "60%",
      },
   },
})

const NewsletterSection = () => {
   const { userData, isLoggedIn } = useAuth()
   const { editMode, group } = useCompanyPage()
   const { asPath } = useRouter()
   const { errorNotification } = useSnackbarNotifications()

   const handleAcceptNewsletter = useCallback(async () => {
      dataLayerCompanyEvent(
         AnalyticsEvents.NewsletterAcceptedOnCompanyPage,
         group
      )
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
   }, [errorNotification, userData?.id, group])

   if (editMode || (isLoggedIn && !userData?.unsubscribed)) {
      return null
   }

   return (
      <PillsBackground
         styles={styles.wrapper}
         isSmallBackground={true}
         bgColor={"#EFF5F8"}
         backgroundUrl={`/stay-up-to-date-banner.svg`}
      >
         <Box sx={styles.content}>
            <Typography
               variant={"brandedH2"}
               fontWeight={"700"}
               color="neutral.800"
            >
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
                     color={"primary"}
                  >
                     Sign me up
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
