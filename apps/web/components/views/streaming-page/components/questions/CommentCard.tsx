import { LivestreamQuestionComment } from "@careerfairy/shared-lib/livestreams"
import { Box, Stack, Typography } from "@mui/material"
import BrandedOptions from "components/views/common/inputs/BrandedOptions"
import { forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { UserDetails } from "../UserDetails"
import { useCommentVisibilityControls } from "./CommentOptionsMenu"
import { getUserTypeFromComment } from "./util"

export const commentCardStyles = sxStyles({
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

export const CommentCard = forwardRef<HTMLDivElement, Props>(
   ({ comment, onOptionsClick }, ref) => {
      const { showOptions } = useCommentVisibilityControls(comment)

      const userType = getUserTypeFromComment(comment)

      return (
         <Stack sx={commentCardStyles.root} spacing={1.25} ref={ref}>
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
)

CommentCard.displayName = "CommentCard"
