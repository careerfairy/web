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

type Data = {
   firstName: string
   lastName: string
   displayName: string
   avatar: string
   background: string
}

export const useMemberData = (
   memberData: UserLivestreamData | string
): Data => {
   const isString = typeof memberData === "string"
   const isUser = !isString

   const { data: streamerDetails } = useStreamerDetails(
      isString ? memberData : null
   )

   const user = isUser ? new UserPresenter(memberData.user) : null

   const avatar = isString ? streamerDetails.avatarUrl : user.model.avatar
   const firstName = isString ? streamerDetails.firstName : user.model.firstName
   const lastName = isString ? streamerDetails.lastName : user.model.lastName
   const displayName = isString
      ? getStreamerDisplayName(
           streamerDetails?.firstName,
           streamerDetails?.lastName
        )
      : user.getDisplayName()
   const background = isString ? streamerDetails.role : user.getBackground()

   return {
      firstName,
      lastName,
      displayName,
      avatar,
      background,
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
