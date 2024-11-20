import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Button, Stack, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import CircularLogo from "components/views/common/logos/CircularLogo"
import Image from "next/image"
import { SyntheticEvent, useCallback } from "react"
import { UserPlus } from "react-feather"

const CARD_WIDTH = 254

const styles = sxStyles({
   root: {
      width: `${CARD_WIDTH}px`,
      gap: 0,
      borderRadius: "8px",
      border: "1px solid #F0EDFD",
      boxShadow: "0px 0px 8px 0px #1414140F",
      userSelect: "none",
      cursor: "pointer",
   },
   bannerContainer: {
      position: "relative",
      height: "66px",
      borderRadius: "8px 8px 0 0",
   },
   bannerEffect: {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: -2,
      backdropFilter: "blur(10px)",
      width: "100%",
      height: "100%",
      borderRadius: "8px 8px 0 0",
   },
   bannerEffectColor: {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: -3,
      width: "100%",
      height: "100%",
      backgroundColor: "#8E8E8E",
      borderRadius: "8px 8px 0 0",
      opacity: 0.5,
   },
   bannerImage: {
      zIndex: -4,
      borderRadius: "8px 8px 0 0",
      objectFit: "cover",
   },
   dataContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 12px 12px 12px",
      gap: "8px",
      height: "calc(100% - 66px)",
      marginTop: "-40px",
   },
   avatar: {
      position: "relative",
   },
   infoContainer: {
      textAlign: "center",
   },
   companyLogoContainer: {
      position: "absolute",
      bottom: 1,
      right: 1,
   },
   companyLogoWrapper: {
      marginTop: "5px",
      marginLeft: "-1px",
   },
   name: {
      ...getMaxLineStyles(1),
      fontWeight: 700,
      color: (theme) => theme.palette.neutral["800"],
   },
   position: {
      ...getMaxLineStyles(1),
      color: (theme) => theme.palette.neutral["600"],
   },
   companyName: {
      ...getMaxLineStyles(2),
      color: (theme) => theme.palette.neutral["600"],
   },
   companyNameBold: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral["600"],
   },
   followButton: {
      padding: "8px 16px",
   },
})

type Props = {
   bannerUrl: string
   avatarUrl: string
   name: string
   position: string
   companyName: string
   companyLogoUrl: string
}

export const MentorCard = ({
   bannerUrl,
   avatarUrl,
   name,
   position,
   companyName,
   companyLogoUrl,
}: Props) => {
   const handleCardClick = useCallback(() => {
      alert("Card clicked")
      console.log("Card clicked")
   }, [])

   const handleFollowClick = useCallback((event: SyntheticEvent) => {
      event.preventDefault()
      event.stopPropagation()
      alert("Follow clicked")
      console.log("Follow clicked")
   }, [])

   return (
      <Stack sx={styles.root} onClick={handleCardClick}>
         <Box sx={styles.bannerContainer}>
            <Box sx={styles.bannerEffect} />
            <Box sx={styles.bannerEffectColor} />
            <Image
               src={bannerUrl}
               alt={"banner"}
               fill
               style={styles.bannerImage}
            />
         </Box>
         <Stack sx={styles.dataContainer}>
            <Box sx={styles.avatar}>
               <CircularLogo
                  src={avatarUrl}
                  alt={"Mentor's avatar"}
                  objectFit="cover"
                  size={80}
               />
               <Box sx={styles.companyLogoContainer}>
                  <Box sx={styles.companyLogoWrapper}>
                     <CircularLogo
                        src={companyLogoUrl}
                        alt={`${companyName}'s logo`}
                        objectFit="cover"
                        size={24}
                     />
                  </Box>
               </Box>
            </Box>
            <Stack sx={styles.infoContainer}>
               <Typography variant="brandedH5" sx={styles.name}>
                  {name}
               </Typography>

               <Typography variant="small" sx={styles.position}>
                  {position}
               </Typography>
               <Typography variant="small" sx={styles.companyName}>
                  {" "}
                  at{" "}
                  <Box component="span" sx={styles.companyNameBold}>
                     {companyName}
                  </Box>
               </Typography>
            </Stack>
            <Button
               variant="contained"
               color="primary"
               startIcon={<UserPlus />}
               fullWidth
               sx={styles.followButton}
               onClick={handleFollowClick}
            >
               Follow
            </Button>
         </Stack>
      </Stack>
   )
}

MentorCard.width = CARD_WIDTH
