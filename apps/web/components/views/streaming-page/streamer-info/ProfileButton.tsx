import { transformCreatorNameIntoSlug } from "@careerfairy/shared-lib/groups/creators"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { Button } from "@mui/material"
import useGroup from "components/custom-hook/group/useGroup"
import { StreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import useIsMobile from "components/custom-hook/useIsMobile"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   profileButton: (theme) => ({
      color: `${theme.palette.neutral[600]}`,
      backgroundColor: `${theme.brand.white[100]}`,
      textAlign: "center",
      "&:hover": {
         backgroundColor: `${theme.brand.white[200]}`,
      },
   }),
   profileButtonPrimary: (theme) => ({
      border: `1px solid ${theme.palette.neutral[200]}`,
      "&:hover": {
         border: `1px solid ${theme.palette.neutral[100]}`,
      },
   }),
})

type ProfileButtonProps = {
   streamerDetails: StreamerDetails
   isPrimary?: boolean
}

export const ProfileButton = ({
   streamerDetails,
   isPrimary = false,
}: ProfileButtonProps) => {
   const isMobile = useIsMobile()
   const { data: streamerGroup } = useGroup(streamerDetails.groupId)

   if (!streamerDetails.id || !streamerGroup) return

   return (
      <Button
         target="_blank"
         variant={isPrimary ? "text" : "outlined"}
         sx={[styles.profileButton, isPrimary && styles.profileButtonPrimary]}
         href={`/company/${companyNameSlugify(
            streamerGroup.universityName
         )}/mentor/${transformCreatorNameIntoSlug(
            streamerDetails.firstName,
            streamerDetails.lastName
         )}/${streamerDetails.id}`}
         fullWidth={isMobile}
      >
         Visit speaker profile
      </Button>
   )
}
