import { Box, Stack, Typography } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { useCallback, useState } from "react"
import { AnalyticsEvents } from "util/analytics/types"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../types/commonTypes"
import { dataLayerLivestreamEvent } from "../../../../../util/analyticsUtils"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import BaseDialogView, {
   HeroContent,
   HeroTitle,
   MainContent,
} from "../../BaseDialogView"
import { useLiveStreamDialog, ViewKey } from "../../LivestreamDialog"
import { PrimarySecondaryButtons } from "../data-consent/RegisterDataConsentView"

const styles = sxStyles({
   contentOffset: {
      mt: { xs: -10.3, md: -14 },
      px: { xs: "auto", md: 5 },
   },
   joinText: {
      fontSize: 17,
      textAlign: "center",
   },
   avatar: {
      borderRadius: { xs: "70px", md: "91px" },
      border: "1.5px solid",
      borderColor: (theme) => theme.brand.white[400],
   },
   heroContent: {
      height: { xs: "229px", md: "366px" },
   },
   actionButtons: {
      width: {
         xs: "100%",
         md: "auto",
      },
      mb: {
         xs: "auto",
         md: "40px !important",
      },
   },
   logoTextContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: { xs: "30px", md: "60px" },
   },
   minHeight: {
      minHeight: { xs: "300px", md: "400px" },
   },
})

const NEXT_VIEW: ViewKey = "register-success"
const PREVIOUS_VIEW: ViewKey = "register-ask-questions"

const RegisterJoinTalentPoolView = () => {
   const { livestream, goToView } = useLiveStreamDialog()
   const isMobile = useIsMobile()
   const [isJoiningTalentPool, setIsJoiningTalentPool] = useState(false)
   const { joinCompanyTalentPool } = useFirebaseService()
   const { userData } = useAuth()
   const { errorNotification } = useSnackbarNotifications()

   const handleJoinTalentPool = useCallback(async () => {
      try {
         setIsJoiningTalentPool(true)
         await joinCompanyTalentPool(livestream.companyId, userData, livestream)
         dataLayerLivestreamEvent(
            AnalyticsEvents.EventRegistrationTalentpoolJoin,
            livestream
         )

         goToView(NEXT_VIEW)
      } catch (e) {
         errorNotification(e)
         setIsJoiningTalentPool(false)
      }
   }, [
      errorNotification,
      goToView,
      joinCompanyTalentPool,
      livestream,
      userData,
   ])

   const handleCancel = useCallback(() => {
      dataLayerLivestreamEvent(
         AnalyticsEvents.EventRegistrationTalentpoolSkip,
         livestream
      )
      goToView(NEXT_VIEW)
   }, [goToView, livestream])

   const goToPrevious = useCallback(() => {
      goToView(PREVIOUS_VIEW)
   }, [goToView])

   return (
      <BaseDialogView
         heroContent={
            <HeroContent
               backgroundImg={getResizedUrl(
                  livestream.backgroundImageUrl,
                  "lg"
               )}
               onBackPosition={"top-left"}
               onBackClick={goToPrevious}
               noMinHeight
               sx={styles.heroContent}
            >
               <Stack
                  alignItems="center"
                  justifyContent={"center"}
                  pt={3}
                  pb={9}
               >
                  <Title companyName={livestream.company} />
               </Stack>
            </HeroContent>
         }
         mainContent={
            <MainContent sx={styles.minHeight}>
               <Stack alignItems="center" spacing={7} sx={styles.contentOffset}>
                  <Box sx={styles.logoTextContainer}>
                     <CircularLogo
                        src={getResizedUrl(livestream.companyLogoUrl, "lg")}
                        alt={livestream.company}
                        size={isMobile ? 80 : 136}
                        sx={styles.avatar}
                     />

                     <JoinText companyName={livestream.company} />
                  </Box>

                  {isMobile ? null : (
                     <ActionButtons
                        isJoiningTalentPool={isJoiningTalentPool}
                        handleJoinTalentPool={handleJoinTalentPool}
                        handleCancel={handleCancel}
                     />
                  )}
               </Stack>
            </MainContent>
         }
         hideBottomDivider
         fixedBottomContent={
            isMobile ? (
               <ActionButtons
                  isJoiningTalentPool={isJoiningTalentPool}
                  handleJoinTalentPool={handleJoinTalentPool}
                  handleCancel={handleCancel}
               />
            ) : null
         }
      />
   )
}

const ActionButtons = ({
   isJoiningTalentPool,
   handleJoinTalentPool,
   handleCancel,
}) => {
   return (
      <Box sx={styles.actionButtons}>
         <PrimarySecondaryButtons
            loading={isJoiningTalentPool}
            secondaryText="Maybe later"
            onClickPrimary={handleJoinTalentPool}
            onClickSecondary={handleCancel}
            primaryText="Join talent pool"
         />
      </Box>
   )
}

const Title = ({ companyName }: { companyName: string }) => {
   return (
      <HeroTitle>
         Join {companyName}
         {"'"}s
         <br />
         talent pool
      </HeroTitle>
   )
}

const JoinText = ({ companyName }: { companyName: string }) => {
   return (
      <Box>
         <Typography sx={styles.joinText}>
            {`Join ${companyName}'s talent pool and be contacted directly in case any
            relevant opportunity arises for you at ${companyName} in the future.
            By joining the talent pool, you agree that your profile data will be
            shared with ${companyName}. Don't worry, you can leave their
            talent pool at any time.`}
         </Typography>
      </Box>
   )
}

export default RegisterJoinTalentPoolView
