import UserPresenter from "@careerfairy/shared-lib/users/UserPresenter"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { Stack, Typography } from "@mui/material"
import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import UserAvatar from "components/views/common/UserAvatar"
import React, { memo } from "react"
import { sxStyles } from "types/commonTypes"
import { getStreamerDisplayName } from "../../util"

export const styles = sxStyles({
   contentWrapper: {
      p: 0,
   },
   viewer: {
      py: 1,
      px: 2,
   },
   loader: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
   },
})

type ViewerData = {
   firstName: string
   lastName: string
   displayName: string
   avatar: string
   background: string
}

/**
 * Transforms member data or streamer ID into a standardized format.
 */
const useMemberData = (memberData: UserLivestreamData | string): ViewerData => {
   const shouldFetchStreamerDetails = typeof memberData === "string"

   const { data: streamerDetails } = useStreamerDetails(
      shouldFetchStreamerDetails ? memberData : null
   )

   if (shouldFetchStreamerDetails) {
      return {
         firstName: streamerDetails.firstName,
         lastName: streamerDetails.lastName,
         displayName: getStreamerDisplayName(
            streamerDetails.firstName,
            streamerDetails.lastName
         ),
         avatar: streamerDetails.avatarUrl,
         background: streamerDetails.role,
      }
   }

   const user = new UserPresenter(memberData.user)
   return {
      firstName: user.model.firstName,
      lastName: user.model.lastName,
      displayName: user.getDisplayName(),
      avatar: user.model.avatar,
      background: user.getBackground(),
   }
}

type ViewerProps = {
   memberData: UserLivestreamData | string
   style: React.CSSProperties
}

export const Viewer = memo(({ memberData, style }: ViewerProps) => {
   const { firstName, lastName, displayName, avatar, background } =
      useMemberData(memberData)

   return (
      <Stack direction="row" spacing={0.75} style={style} sx={styles.viewer}>
         <UserAvatar
            size={44}
            data={{
               firstName,
               lastName,
               avatar,
            }}
         />
         <Stack flex={1}>
            <Typography
               sx={getMaxLineStyles(1)}
               variant="medium"
               color="neutral.800"
               fontWeight={600}
            >
               {displayName}
            </Typography>
            <Typography
               sx={getMaxLineStyles(1)}
               variant="small"
               color="neutral.400"
            >
               {background}
            </Typography>
         </Stack>
      </Stack>
   )
})

Viewer.displayName = "Viewer"
