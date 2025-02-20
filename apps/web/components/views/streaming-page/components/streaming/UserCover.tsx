import { Avatar, Box, Typography, alpha } from "@mui/material"
import { StreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import Image from "next/image"
import { useIsSpotlightMode } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { FloatingContent } from "./VideoTrackWrapper"

const MOBILE_AVATAR_SIZE = 65
const DESKTOP_AVATAR_SIZE = 100
const DESKTOP_SPOTLIGHT_AVATAR_SIZE = 75
const styles = sxStyles({
   root: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   image: {
      width: {
         xs: MOBILE_AVATAR_SIZE,
         tablet: DESKTOP_AVATAR_SIZE,
      },
      height: {
         xs: MOBILE_AVATAR_SIZE,
         tablet: DESKTOP_AVATAR_SIZE,
      },
   },
   spotlightImage: {
      width: {
         xs: MOBILE_AVATAR_SIZE,
         tablet: DESKTOP_SPOTLIGHT_AVATAR_SIZE,
      },
      height: {
         xs: MOBILE_AVATAR_SIZE,
         tablet: DESKTOP_SPOTLIGHT_AVATAR_SIZE,
      },
   },
   border: {
      border: {
         xs: "10px solid transparent",
         tablet: "21px solid transparent",
      },
      borderRadius: "50%",
      padding: "5px",
      background: (theme) => alpha(theme.palette.neutral[100], 0.2),
   },
   initials: {
      fontSize: {
         xs: 30,
         tablet: 55,
      },
      fontWeight: 500,
   },
})
export interface UserCoverProps {
   streamerDetails: StreamerDetails
}

/**
 * User Cover image OR initials
 */
export const UserCover = ({ streamerDetails }: UserCoverProps) => {
   const { avatarUrl, firstName, lastName } = streamerDetails
   const isSpotlightMode = useIsSpotlightMode()

   return (
      <FloatingContent sx={styles.root}>
         <Box sx={styles.border}>
            <Avatar
               sx={[styles.image, isSpotlightMode && styles.spotlightImage]}
            >
               {avatarUrl ? (
                  <Image
                     alt="cover"
                     src={avatarUrl}
                     layout="fill"
                     objectFit="cover"
                  />
               ) : (
                  <Typography variant="h1" sx={styles.initials}>
                     {getInitials(firstName, lastName)}
                  </Typography>
               )}
            </Avatar>
         </Box>
      </FloatingContent>
   )
}

const getInitials = (firstName: string, lastName: string) => {
   const firstInitial = (firstName && firstName[0].toUpperCase()) || "A"
   const lastInitial = (lastName && lastName[0].toUpperCase()) || "A"
   return `${firstInitial}${lastInitial}`
}
