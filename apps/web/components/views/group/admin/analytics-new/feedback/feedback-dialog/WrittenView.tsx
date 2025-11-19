import { EventRatingAnswer } from "@careerfairy/shared-lib/livestreams"
import { Avatar, Box, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
   avatar: {
      width: 28,
      height: 28,
      fontSize: 12,
      bgcolor: "secondary.main",
   },
   answerCard: {
      p: 2,
      borderRadius: 1,
      border: 1,
      borderColor: "neutral.200",
      backgroundColor: "white",
   },
})

type WrittenViewProps = {
   voters: EventRatingAnswer[]
   total: number
}

export const WrittenView = ({ voters, total }: WrittenViewProps) => {
   return (
      <Stack spacing={2}>
         <Typography variant="small" color="text.secondary">
            {total} answers
         </Typography>
         <Stack spacing={2}>
            {voters.map((answer) => (
               <Box key={answer.id} sx={styles.answerCard}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                     <Avatar src={answer.user?.avatarUrl} sx={styles.avatar}>
                        {answer.user?.firstName?.[0] ||
                           answer.user?.lastName?.[0] ||
                           "?"}
                     </Avatar>
                     <Typography variant="body2" color="text.secondary">
                        {answer.message}
                     </Typography>
                  </Stack>
               </Box>
            ))}
         </Stack>
      </Stack>
   )
}
