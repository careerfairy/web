import { slugify } from "@careerfairy/shared-lib/dist/utils"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import { IconButton } from "@mui/material"
import { groupRepo } from "data/RepositoryInstances"
import { useRouter } from "next/router"
import { FC } from "react"
import { useSelector } from "react-redux"
import { sparksGroupIdSelector } from "store/selectors/sparksFeedSelectors"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      color: "white",
      "& svg": {
         width: 27.83,
         height: 27.83,
      },
   },
})

const CloseSparksFeedButton: FC = () => {
   const router = useRouter()
   const groupId = useSelector(sparksGroupIdSelector)

   const handleOnClick = async () => {
      // if the user came from the company page, go back to the company page
      if (groupId) {
         const group = await groupRepo.getGroupById(groupId)

         if (!group) {
            router.push("/portal")
         }
         const companyName = companyNameSlugify(group.universityName)

         router.push(`/company/${companyName}`)
      } else {
         router.push("/portal")
      }
   }

   return (
      <IconButton
         sx={styles.root}
         aria-label="close-sparks-feed"
         onClick={handleOnClick}
      >
         <CloseRoundedIcon color="inherit" />
      </IconButton>
   )
}

export default CloseSparksFeedButton
