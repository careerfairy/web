import { Box, Card, Stack, Typography } from "@mui/material"
import { useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"
import useGroupsByIds from "../../../../custom-hook/useGroupsByIds"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import useRegistrationHandler from "../../useRegistrationHandler"
import ActionButton from "../livestream-details/action-button/ActionButton"
import Speakers from "../livestream-details/main-content/Speakers"
import { MobileDateAndTime } from "./DateAndTime"
import { HeroSection } from "./hero/HeroSection"
import { CompaniesCarousel } from "./main-content/CompaniesCarousel"

const styles = sxStyles({
   title: {
      color: "common.white",
      textTransform: "uppercase",
      fontFamily: "Roboto Slab",
      fontWeight: 400,
      textShadow:
         "-1.186px 1.186px 0px #000000, -2.372px 2.372px 0px #000000, -3.559px 3.559px 0px #000000",
      fontSize: { xs: "27.648px", md: "37.957px" },
      lineHeight: { xs: "32px", md: "42px" },
      "& .title-large": {
         fontSize: { xs: "36.288px", md: "49.819px" },
         lineHeight: { xs: "36px", md: "46px" },
         display: "block",
      },
   },

   avatarGroup: {
      "& .MuiAvatar-root": {
         width: { xs: 28, md: 36 },
         height: { xs: 28, md: 36 },
         border: "2px solid white",
      },
   },

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
   },
})

const PanelDetailsView = () => {
   const { livestream, livestreamPresenter, serverUserEmail } =
      useLiveStreamDialog()

   const { handleRegisterClick } = useRegistrationHandler()

   const isMobile = useIsMobile()
   const [heroRef, heroInView] = useInView()

   const isFloatingActionButton = isMobile || !heroInView

   // Fetch actual companies data using groupIds from livestream
   const { data: participatingCompanies, status } = useGroupsByIds(
      livestream?.groupIds || [],
      false // disable suspense to avoid blocking render
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
            companies={participatingCompanies}
            ref={heroRef}
            isFloatingActionButton={isFloatingActionButton}
            heroInView={heroInView}
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
                  <Typography variant="medium" sx={styles.aboutText}>
                     {livestream?.summary}
                  </Typography>
               </Stack>
            </Card>

            {/* Participating companies */}
            <Card sx={styles.sectionCard}>
               <Stack spacing={1.5}>
                  <CompaniesCarousel
                     companies={participatingCompanies}
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
