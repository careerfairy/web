import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { sxStyles } from "../../../../../types/commonTypes"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog, ViewKey } from "../../LivestreamDialog"
import {
   HostImage,
   PrimarySecondaryButtons,
} from "../data-consent/RegisterDataConsentView"
import { useCallback, useState } from "react"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { dataLayerLivestreamEvent } from "../../../../../util/analyticsUtils"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"

const styles = sxStyles({
   title: {
      textAlign: "center",
      fontWeight: 500,
      lineHeight: 1.3,
      fontSize: {
         xs: "1.9rem",
         sm: "2.571rem",
      },
      maxWidth: 655,
   },
   contentOffset: {
      mt: -13,
   },
   joinText: {
      fontSize: 12,
      textAlign: "center",
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
            "event_registration_talentpool_join",
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
      dataLayerLivestreamEvent("event_registration_talentpool_skip", livestream)
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
            <MainContent>
               <Stack
                  alignItems="center"
                  spacing={5}
                  sx={styles.contentOffset}
                  px={isMobile ? 1 : 5}
               >
                  <HostImage
                     imageUrl={livestream.companyLogoUrl}
                     alt={livestream.company}
                  />

                  <JoinText companyName={livestream.company} />

                  <PrimarySecondaryButtons
                     loading={isJoiningTalentPool}
                     onClickPrimary={handleJoinTalentPool}
                     onClickSecondary={handleCancel}
                     primaryText="Join talent pool"
                  />
               </Stack>
            </MainContent>
         }
      />
   )
}

const Title = ({ companyName }: { companyName: string }) => {
   return (
      <Typography
         align="center"
         variant={"h3"}
         component="h1"
         sx={styles.title}
      >
         Join {companyName}
         <br />
         Talent Pool
      </Typography>
   )
}

const JoinText = ({ companyName }: { companyName: string }) => {
   return (
      <Box>
         <Typography sx={styles.joinText}>
            Join {companyName} Talent Pool and be contacted directly in case any
            relevant opportunity arises for you at {companyName} in the future.
            By joining the Talent Pool, you agree that your profile data will be
            shared with {companyName}. Don{"'"}t worry, you can leave their
            Talent Pool at any time.
         </Typography>
      </Box>
   )
}

export default RegisterJoinTalentPoolView
