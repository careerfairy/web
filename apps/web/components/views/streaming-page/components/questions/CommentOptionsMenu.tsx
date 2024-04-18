import {
   LivestreamQuestionComment,
   checkIsQuestionCommentAuthor,
} from "@careerfairy/shared-lib/livestreams"
import { useAuth } from "HOCs/AuthProvider"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useDeleteLivestreamQuestionComment } from "components/custom-hook/streaming/useDeleteLivestreamQuestionComment"
import BrandedResponsiveMenu, {
   MenuOption,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { Trash2 as DeleteIcon } from "react-feather"
import { useStreamingContext } from "../../context"
import { livestreamService } from "data/firebase/LivestreamService"

type Props = {
   handleClose: () => void
   questionId: string
   comment: LivestreamQuestionComment
   anchorEl: HTMLElement
}

export const CommentOptionsMenu = ({
   questionId,
   handleClose,
   anchorEl,
   comment,
}: Props) => {
   const { authenticatedUser } = useAuth()
   const streamIsMobile = useStreamIsMobile()
   const { isHost, agoraUserId, livestreamId } = useStreamingContext()

   const open = Boolean(anchorEl)

   const { trigger: triggerDeleteComment, isMutating: isDeletingComment } =
      useDeleteLivestreamQuestionComment(
         livestreamService.getLivestreamRef(livestreamId),
         questionId,
         comment?.id
      )

   const getOptions = () => {
      const options: MenuOption[] = []

      if (
         isHost ||
         checkIsQuestionCommentAuthor(comment, {
            uid: authenticatedUser.uid,
            agoraUid: agoraUserId,
         })
      ) {
         options.push({
            label: "Delete comment",
            icon: <DeleteIcon />,
            handleClick: () => triggerDeleteComment(),
            loading: isDeletingComment,
            color: "error.main",
         })
      }

      return options
   }

   const options = getOptions()

   if (options.length === 0) {
      return null
   }

   return (
      <BrandedResponsiveMenu
         options={options}
         open={open}
         handleClose={handleClose}
         anchorEl={anchorEl}
         isMobileOverride={streamIsMobile}
      />
   )
}
