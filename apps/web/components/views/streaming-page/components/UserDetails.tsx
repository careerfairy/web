import { Stack, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import ColorizedAvatar from "components/views/common/ColorizedAvatar"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { ReactNode } from "react"
import { useCompanyLogoUrl } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { UserType, getStreamerDisplayName } from "../util"

const AVATAR_SIZE = 29

const styles = sxStyles({
   details: {
      alignItems: "center",
   },
   avatar: {
      height: AVATAR_SIZE,
      width: AVATAR_SIZE,
      color: "white",
      fontSize: "1rem",
   },
   displayNameColor: {
      [UserType.Streamer]: {
         color: "secondary.main",
      },
      [UserType.Assistant]: {
         color: "secondary.main",
      },
      [UserType.CareerFairy]: {
         color: "primary.main",
      },
      [UserType.Viewer]: {
         color: "neutral.800",
      },
   },
   hostTag: {
      fontSize: "0.714rem",
      color: (theme) => theme.brand.black[700],
      fontStyle: "italic",
      fontWeight: 400,
   },
})

type Props = {
   userType: UserType
   displayName: string
   color?: string
   subHeader?: ReactNode
}

export const UserDetails = ({
   userType,
   displayName,
   color,
   subHeader,
}: Props) => {
   const [firstName, lastName] = displayName.split(" ")
   return (
      <Stack direction="row" spacing={1} sx={styles.details}>
         <EntryAvatar
            userType={userType}
            firstName={firstName}
            lastName={lastName}
         />
         <Stack spacing={0.25}>
            <Typography
               color="neutral.800"
               fontWeight={600}
               variant="small"
               sx={[
                  color ? { color } : styles.displayNameColor[userType],
                  getMaxLineStyles(1),
               ]}
            >
               {userType === UserType.CareerFairy ? "CareerFairy" : displayName}
               {isHost(userType) && (
                  <Typography
                     component="span"
                     sx={[styles.hostTag, color && { color }]}
                  >
                     {" "}
                     (Host)
                  </Typography>
               )}
            </Typography>
            {subHeader}
         </Stack>
      </Stack>
   )
}

type EntryAvatarProps = {
   userType: UserType
   firstName: string
   lastName: string
}

const EntryAvatar = ({
   userType: userType,
   firstName,
   lastName,
}: EntryAvatarProps) => {
   const companyLogoUrl = useCompanyLogoUrl()

   if (
      userType === UserType.Viewer ||
      (isHost(userType) && !companyLogoUrl) // Edge-case: When livestream is missing company logo, we use initials
   ) {
      return (
         <ColorizedAvatar
            sx={styles.avatar}
            firstName={firstName}
            lastName={lastName}
         />
      )
   }

   return (
      <CircularLogo
         src={isHost(userType) ? companyLogoUrl : "/logo-green.png"}
         size={AVATAR_SIZE}
         alt={getStreamerDisplayName(firstName, lastName)}
      />
   )
}

const isHost = (userType: UserType) => {
   return userType === UserType.Streamer || userType === UserType.Assistant
}
