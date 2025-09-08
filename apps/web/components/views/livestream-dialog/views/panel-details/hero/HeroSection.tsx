import { Group } from "@careerfairy/shared-lib/groups"
import { Avatar, Box, IconButton, Skeleton } from "@mui/material"
import useTrackLivestreamView from "components/custom-hook/live-stream/useTrackLivestreamView"
import useIsMobile from "components/custom-hook/useIsMobile"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import { useLiveStreamDialog } from "components/views/livestream-dialog/LivestreamDialog"
import useRegistrationHandler from "components/views/livestream-dialog/useRegistrationHandler"
import Image from "next/image"
import { forwardRef } from "react"
import { ChevronLeft, X } from "react-feather"
import { sxStyles } from "types/commonTypes"
import ActionButton from "../../livestream-details/action-button/ActionButton"
import { HeroDateAndTime } from "../DateAndTime"
import ShareButton from "./ShareButton"

const styles = sxStyles({
   heroContainer: {
      position: "relative",
      height: { xs: "579px", md: "539px" },
      width: "100%",
      overflow: "hidden",
      backgroundSize: "cover",
      backgroundPosition: { xs: "right center", md: "center" },
   },
   topActions: {
      position: "absolute",
      top: "16px",
      right: "16px",
      display: "flex",
      gap: { xs: 1, md: "26px" },
      alignItems: "center",
   },
   backButton: {
      position: "absolute",
      top: "16px",
      left: "16px",
      backgroundColor: "rgba(52, 52, 52, 0.5)",
      color: "common.white",
      padding: "8px",
      borderRadius: "28px",
      "&:hover": {
         backgroundColor: "rgba(52, 52, 52, 0.7)",
      },
   },
   closeButton: {
      backgroundColor: "transparent",
      color: "common.white",
      padding: 0,
      borderRadius: 0,
      "&:hover": {
         backgroundColor: "transparent",
      },
   },
   heroContent: {
      position: "absolute",
      bottom: "35px",
      left: { xs: "16px", md: "34px" },
      width: { xs: "216px", md: "297px" },
      display: "flex",
      flexDirection: "column",
      gap: { xs: 4, md: 2.5 },
   },
   panelLogoContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      marginBottom: 0,
      maxWidth: { xs: "216px", md: "297px" },
      width: "100%",
   },
   heroCompaniesRow: {
      display: "flex",
      gap: 0.5,
      alignItems: "center",
      justifyContent: "flex-start",
   },
   heroCompanyAvatar: {
      width: { xs: 28, md: 36 },
      height: { xs: 28, md: 36 },
      borderRadius: "70px",
      border: "none",
   },
})

type HeroProps = {
   companies: Group[]
   isFloatingActionButton: boolean
   heroInView: boolean
   isLoading?: boolean
}

export const HeroSection = forwardRef<HTMLDivElement, HeroProps>(
   ({ companies, isFloatingActionButton, heroInView, isLoading }, ref) => {
      const {
         livestream,
         livestreamPresenter,
         serverUserEmail,
         closeDialog,
         handleBack,
      } = useLiveStreamDialog()
      const { handleRegisterClick } = useRegistrationHandler()
      const isMobile = useIsMobile()
      const viewRef = useTrackLivestreamView(livestream)

      return (
         <Box
            ref={ref}
            sx={[
               styles.heroContainer,
               {
                  backgroundImage: {
                     xs: `
                  linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%),
                  linear-gradient(rgba(0, 0, 0, 0) 72.937%, rgba(0, 0, 0, 0.5) 97.409%),
                  url(${getResizedUrl(livestream?.backgroundImageUrl, "lg")})
               `,
                     md: `
                  linear-gradient(263.493deg, rgba(0, 0, 0, 0) 30.917%, rgb(0, 0, 0) 81.906%),
                  linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%),
                  linear-gradient(rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 23.377%),
                  linear-gradient(rgba(0, 0, 0, 0) 72.937%, rgba(0, 0, 0, 0.5) 97.409%),
                  url(${getResizedUrl(livestream?.backgroundImageUrl, "lg")})
               `,
                  },
               },
            ]}
         >
            {/* Back Button (Mobile Only) */}
            {isMobile ? (
               <IconButton sx={styles.backButton} onClick={handleBack}>
                  <ChevronLeft size={20} />
               </IconButton>
            ) : null}

            {/* Top Actions */}
            <Box sx={styles.topActions}>
               <ShareButton livestream={livestream} />
               {!isMobile && (
                  <IconButton sx={styles.closeButton} onClick={closeDialog}>
                     <X size={24} color="white" />
                  </IconButton>
               )}
            </Box>

            {/* Hero Content */}
            <Box sx={styles.heroContent} ref={viewRef}>
               {livestream?.panelLogoUrl ? (
                  <Box sx={styles.panelLogoContainer}>
                     <Image
                        src={getResizedUrl(livestream.panelLogoUrl, "lg")}
                        alt="Panel Logo"
                        width={297}
                        height={120}
                        style={{
                           width: "100%",
                           height: "auto",
                        }}
                        priority
                        sizes="(max-width: 768px) 216px, 297px"
                     />
                  </Box>
               ) : null}

               {!isMobile && (
                  <HeroDateAndTime eventDate={livestreamPresenter.start} />
               )}

               <Box sx={styles.heroCompaniesRow}>
                  {isLoading
                     ? Array.from({ length: 3 }).map((_, index) => (
                          <Skeleton
                             variant="circular"
                             key={index}
                             sx={[
                                styles.heroCompanyAvatar,
                                { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                             ]}
                          />
                       ))
                     : companies.map((company) => (
                          <Avatar
                             key={company.id}
                             src={getResizedUrl(company.logoUrl, "sm")}
                             alt={company.universityName}
                             sx={styles.heroCompanyAvatar}
                          />
                       ))}
               </Box>

               {!isFloatingActionButton && (
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
         </Box>
      )
   }
)

HeroSection.displayName = "HeroSection"
