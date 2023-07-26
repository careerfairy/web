import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Box } from "@mui/material"
import CreatorAvatar from "components/views/sparks/components/CreatorAvatar"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   creatorCardAvatar: {
      height: 64,
      width: 64,
   },
})

type Props = {
   creator: Creator
}

const CreatorDetails: FC<Props> = ({ creator }) => {
   return (
      <Box>
         <CreatorAvatar creator={creator} sx={styles.creatorCardAvatar} />
      </Box>
   )
}

export default CreatorDetails
