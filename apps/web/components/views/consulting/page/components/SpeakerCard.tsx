import { Group } from "@careerfairy/shared-lib/groups"
import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { Box, Stack, SxProps, Typography, useTheme } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { LinkedInIcon } from "components/views/common/icons/LinkedInIcon"
import CircularLogo from "components/views/common/logos/CircularLogo"
import Image from "next/image"
import Link from "next/link"
import { MouseEventHandler } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"
import { buildMentorPageLink } from "util/routes"

const styles = sxStyles({
   root: {
      backgroundColor: "white",
      borderRadius: "10.941px",
      border: "1px solid",
      borderColor: "secondary.light",
      cursor: "pointer",
      userSelect: "none",
      overflow: "hidden",
      position: "relative",
      "&:hover": {
         borderColor: "secondary.100",
         boxShadow: "0 0 12px 0 rgba(20, 20, 20, 0.08)",
      },
      width: "100%",
      maxWidth: "100%",
      height: "100%",
      alignSelf: "center",
   },
   bannerContainer: {
      position: "relative",
      height: { xs: "42.874px", tablet: "45.131px" },
      width: "100%",
      overflow: "hidden",
   },
   bannerImage: {
      objectFit: "cover",
      width: "100%",
      height: "100%",
   },
   bannerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backdropFilter: "blur(6.838px)",
      backgroundColor: "rgba(142, 142, 142, 0.5)",
   },
   linkedinContainer: {
      position: "absolute",
      top: { xs: "5.2px", tablet: "5.47px" },
      right: { xs: "5.2px", tablet: "5.47px" },
      backgroundColor: "rgba(243, 243, 245, 0.95)",
      borderRadius: { xs: "25.984px", tablet: "27.352px" },
      padding: { xs: "3.898px", tablet: "4.103px" },
      gap: { xs: "6.496px", tablet: "6.838px" },
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
   },
   linkedinIcon: {
      width: { xs: "9.094px", tablet: "9.573px" },
      height: { xs: "9.094px", tablet: "9.573px" },
      color: "info.700",
   },
   contentContainer: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      alignItems: "center",
      padding: {
         xs: "0 7.795px 14.685px 7.795px",
         tablet: "0 8.206px 15.985px 8.206px",
      },
      gap: { xs: "5.197px", tablet: "5.47px" },
      marginTop: { xs: "-24.685px", tablet: "-25.985px" },
      position: "relative",
      zIndex: 1,
   },
   avatarContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   avatar: {
      borderRadius: "70px",
      border: "1px solid",
      width: "54.704px",
      height: "54.704px",
   },
   companyLogo: {
      position: "absolute",
      bottom: 0,
      right: 0,
      borderRadius: "70px",
      border: "1px solid",
      backgroundColor: "white",
      width: "16.411px",
      height: "16.411px",
      transform: "translate(-5%, 5%)",
   },
   infoContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "100%",
      gap: { xs: "5.197px", tablet: "5.47px" },
      flex: 1,
   },
   nameContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
   },
   name: {
      color: "neutral.800",
      textAlign: "center",
      fontWeight: 700,
      ...getMaxLineStyles(2),
   },
   positionContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
   },
   position: {
      color: "neutral.600",
      textAlign: "center",
      overflow: "hidden",
      textOverflow: "ellipsis",
      fontSize: { xs: "12px", tablet: "9.573px" },
      lineHeight: { xs: "16px", tablet: "13.676px" },
      fontWeight: 400,
   },
   companyName: {
      color: "neutral.600",
      textAlign: "center",
      overflow: "hidden",
      textOverflow: "ellipsis",
      fontWeight: 600,
   },
})

interface SpeakerCardProps {
   speaker: Speaker
   company: Group
   onClick?: MouseEventHandler
   rootSx?: SxProps
}

export const SpeakerCard = ({
   speaker,
   company,
   onClick,
   rootSx,
}: SpeakerCardProps) => {
   const theme = useTheme()
   const isMobile = useIsMobile()
   const displayName = `${speaker.firstName ?? ""} ${speaker.lastName ?? ""}`
   const mentorPageLink = buildMentorPageLink({
      universityName: company?.universityName ?? speaker.companyName ?? "",
      firstName: speaker.firstName ?? "",
      lastName: speaker.lastName ?? "",
      creatorId: speaker.id,
   })

   return (
      <Stack
         onClick={onClick}
         sx={combineStyles(styles.root, rootSx)}
         component={Link}
         href={mentorPageLink}
      >
         <Box sx={styles.bannerContainer}>
            {Boolean(company?.bannerImageUrl) && (
               <Image
                  src={company.bannerImageUrl}
                  alt="Company banner"
                  fill
                  style={styles.bannerImage}
               />
            )}
            <Box sx={styles.bannerOverlay} />

            {Boolean(speaker.linkedInUrl) && (
               <Box sx={styles.linkedinContainer}>
                  <Box
                     component={LinkedInIcon}
                     sx={styles.linkedinIcon}
                     fill={theme.brand.info[700]}
                  />
               </Box>
            )}
         </Box>

         <Stack sx={styles.contentContainer}>
            <Box sx={styles.avatarContainer}>
               <CircularLogo
                  src={speaker.avatar}
                  alt={`${displayName}'s avatar`}
                  objectFit="cover"
                  size={55}
                  sx={{
                     ...styles.avatar,
                     borderColor: (theme) => theme.brand.white[400],
                  }}
               />
               {Boolean(company?.logoUrl) && (
                  <CircularLogo
                     src={company.logoUrl}
                     alt={`${company.universityName}'s logo`}
                     objectFit="cover"
                     size={16}
                     sx={{
                        ...styles.companyLogo,
                        borderColor: (theme) => theme.brand.white[400],
                     }}
                  />
               )}
            </Box>

            <Stack sx={styles.infoContainer}>
               <Box sx={styles.nameContainer}>
                  <Typography
                     variant={isMobile ? "small" : "xsmall"}
                     sx={styles.name}
                  >
                     {displayName}
                  </Typography>
               </Box>

               <Box sx={styles.positionContainer}>
                  <Typography sx={styles.position}>
                     {speaker.position}
                     {Boolean(company?.universityName) && (
                        <>
                           {" at "}
                           <Box component="span" sx={styles.companyName}>
                              {company.universityName}
                           </Box>
                        </>
                     )}
                  </Typography>
               </Box>
            </Stack>
         </Stack>
      </Stack>
   )
}

export default SpeakerCard