import { Box, Card, Stack, Typography } from "@mui/material"
import LinkifyText from "components/util/LinkifyText"
import { useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"
import useGroupsByIds from "../../../../custom-hook/useGroupsByIds"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { CompaniesCarousel } from "../../../common/company/CompaniesCarousel"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import useRegistrationHandler from "../../useRegistrationHandler"
import ActionButton from "../livestream-details/action-button/ActionButton"
import Speakers from "../livestream-details/main-content/Speakers"
import { MobileDateAndTime } from "./DateAndTime"
import { HeroSection } from "./hero/HeroSection"

const styles = sxStyles({
   mainContainer: {
      backgroundColor: "common.white",
      borderRadius: "12px 12px 0 0",
      padding: { xs: "16px", md: "16px" },
      display: "flex",
      flexDirection: "column",
      gap: 3,
      position: "relative",
      zIndex: 1,
      marginTop: "-12px",
   },
   sectionCard: {
      backgroundColor: (theme) => theme.brand.white[300],
      borderRadius: "8px",
      padding: { xs: "16px", md: "16px" },
      border: "none",
      boxShadow: "none",
   },
   sectionTitle: {
      color: "neutral.800",
      fontWeight: 600,
   },
   aboutText: {
      color: "neutral.700",
      whiteSpace: "pre-line",
   },
})

const CF_GROUP_ID = "i8NjOiRu85ohJWDuFPwo"

const PanelDetailsView = () => {
   const { livestream, livestreamPresenter, serverUserEmail } =
      useLiveStreamDialog()

   const { handleRegisterClick } = useRegistrationHandler()

   const isMobile = useIsMobile()
   const [heroRef, heroInView] = useInView({
      threshold: 0.1,
   })

   const isFloatingActionButton = isMobile || !heroInView

   // Fetch actual companies data using groupIds from livestream
   const { data: participatingCompanies, status } = useGroupsByIds(
      livestream?.groupIds || [],
      false // disable suspense to avoid blocking render
   )

   // TODO: Handle CF in second iteration of the panels
   const participantsWithoutCF = participatingCompanies?.filter(
      (company) => company.id !== CF_GROUP_ID
   )

   return (
      <Box
         sx={{
            backgroundColor: (theme) => theme.brand.white[100],
            height: "100%",
            overflow: "auto",
         }}
      >
         <HeroSection
            companies={participantsWithoutCF}
            ref={heroRef}
            isLoading={status === "loading"}
         />

         {/* Main Content */}
         <Box sx={styles.mainContainer}>
            {/* Mobile Date and Time */}
            {Boolean(isMobile) && (
               <MobileDateAndTime eventDate={livestreamPresenter.start} />
            )}

            {/* Meet the experts */}
            <Card sx={styles.sectionCard}>
               <Stack spacing={1.5}>
                  <Typography variant="brandedBody" sx={styles.sectionTitle}>
                     Meet the experts
                  </Typography>
                  <Speakers
                     speakers={livestream?.speakers}
                     title=""
                     subtitleType="company"
                  />
               </Stack>
            </Card>

            {/* About this event */}
            <Card sx={styles.sectionCard}>
               <Stack spacing={1.5}>
                  <Typography variant="brandedBody" sx={styles.sectionTitle}>
                     About this event
                  </Typography>
                  <LinkifyText>
                     <Typography variant="medium" sx={styles.aboutText}>
                        {livestream?.summary}
                     </Typography>
                  </LinkifyText>
               </Stack>
            </Card>

            {/* Participating companies */}
            <Card sx={styles.sectionCard}>
               <Stack spacing={1.5}>
                  <CompaniesCarousel
                     companies={participantsWithoutCF}
                     isLoading={status === "loading"}
                     title={
                        <Typography
                           variant="brandedBody"
                           sx={styles.sectionTitle}
                        >
                           Participating companies
                        </Typography>
                     }
                  />
               </Stack>
            </Card>
         </Box>

         {/* Floating Action Button */}
         {Boolean(isFloatingActionButton) && (
            <ActionButton
               livestreamPresenter={livestreamPresenter}
               onRegisterClick={handleRegisterClick}
               canWatchRecording={false}
               isFloating={isFloatingActionButton}
               userEmailFromServer={serverUserEmail}
               heroVisible={heroInView}
            />
         )}
      </Box>
   )
}

export default PanelDetailsView
