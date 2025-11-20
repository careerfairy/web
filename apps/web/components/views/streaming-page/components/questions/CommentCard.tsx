import { LivestreamQuestionComment } from "@careerfairy/shared-lib/livestreams"
import { Box, Stack, Typography } from "@mui/material"
import LinkifyText from "components/util/LinkifyText"
import BrandedOptions from "components/views/common/inputs/BrandedOptions"
import { forwardRef } from "react"
import { UserDetails } from "../UserDetails"
import { useCommentVisibilityControls } from "./CommentOptionsMenu"
import { commentCardStyles } from "./QuestionCardStyles"
import { getUserTypeFromComment } from "./util"

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
            <Typography
               variant="small"
               sx={commentCardStyles.title}
               color="neutral.700"
            >
               <LinkifyText>{comment.title}</LinkifyText>
            </Typography>
         </Stack>
      )
   }
)

CommentCard.displayName = "CommentCard"
