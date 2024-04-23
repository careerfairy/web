import { LivestreamQuestionComment } from "@careerfairy/shared-lib/livestreams"
import { Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { UserDetails } from "../UserDetails"
import { getUserTypeFromComment } from "./util"
import BrandedOptions from "components/views/common/inputs/BrandedOptions"
import { Box } from "@mui/material"
import { useCommentVisibilityControls } from "./CommentOptionsMenu"

const styles = sxStyles({
   root: (theme) => ({
      borderRadius: "8px",
      border: `1px solid ${theme.brand.black[300]}`,
      backgroundColor: theme.brand.white[200],
      py: 1,
      pl: 1.5,
      pr: 0.5,
   }),
   optionsIcon: {
      "& svg": {
         width: 21,
         height: 21,
         color: (theme) => theme.brand.black[600],
      },
   },
})

type Props = {
   comment: LivestreamQuestionComment
   onOptionsClick: (event: React.MouseEvent<HTMLElement>) => void
}
export const CommentCard = ({ comment, onOptionsClick }: Props) => {
   const userType = getUserTypeFromComment(comment)

   const { showOptions } = useCommentVisibilityControls(comment)

   return (
      <Stack sx={styles.root} spacing={1.25}>
         <Stack direction="row" justifyContent="space-between">
            <UserDetails userType={userType} displayName={comment.author} />
            {Boolean(showOptions) && (
               <Box component="span">
                  <BrandedOptions onClick={onOptionsClick} />
               </Box>
            )}
         </Stack>
         <Typography variant="small" color="neutral.700">
            {comment.title}
         </Typography>
      </Stack>
   )
}
