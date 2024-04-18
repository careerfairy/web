import { Stack, Typography } from "@mui/material"
import React from "react"
import { UserType, getStreamerDisplayName } from "../util"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { sxStyles } from "types/commonTypes"
import { useCompanyLogoUrl } from "store/selectors/streamingAppSelectors"
import ColorizedAvatar from "components/views/common/ColorizedAvatar"
import CircularLogo from "components/views/common/logos/CircularLogo"

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
}

export const UserDetails = ({ userType, displayName }: Props) => {
   const [firstName, lastName] = displayName.split(" ")
   return (
      <Stack direction="row" spacing={1} sx={styles.details}>
         <EntryAvatar
            userType={userType}
            firstName={firstName}
            lastName={lastName}
         />
         <Typography
            color="neutral.800"
            fontWeight={600}
            variant="small"
            sx={[styles.displayNameColor[userType], getMaxLineStyles(1)]}
         >
            {userType === UserType.CareerFairy ? "CareerFairy" : displayName}
            {userType === UserType.Streamer && (
               <Typography component="span" sx={styles.hostTag}>
                  {" "}
                  (Host)
               </Typography>
            )}
         </Typography>
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
      (userType === UserType.Streamer && !companyLogoUrl) // Edge-case: When livestream is missing company logo, we use initials
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
         src={
            userType === UserType.Streamer ? companyLogoUrl : "/logo-green.png"
         }
         size={AVATAR_SIZE}
         alt={getStreamerDisplayName(firstName, lastName)}
      />
   )
}
