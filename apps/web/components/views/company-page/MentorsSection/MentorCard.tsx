import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Stack, Typography } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { Box, Edit2 } from "react-feather"

type MentorCardProps = {
   creator: Creator
   key?: string
   isEditMode?: boolean
}

const MentorCard = ({ creator, key, isEditMode }: MentorCardProps) => {
   const creatorName = `${creator.firstName} ${creator.lastName}`

   return (
      <Stack key={key}>
         {Boolean(isEditMode) && (
            <Box>
               <Edit2 />
            </Box>
         )}
         <CircularLogo
            src={creator.avatarUrl}
            alt={`Picture of creator ${creatorName}`}
         />
         <Typography variant="h4">{creatorName}</Typography>
         <Typography variant="body1">{creator.position}</Typography>
      </Stack>
   )
}

export default MentorCard
