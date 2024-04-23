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
import { useMemo } from "react"

type Props = {
   handleClose: () => void
   questionId: string
   comment: LivestreamQuestionComment
   anchorEl: HTMLElement
}

/**
 * Controls the visibility of the options menu and its options
 */
export const useCommentVisibilityControls = (
   comment: LivestreamQuestionComment
) => {
   const { isHost, agoraUserId } = useStreamingContext()
   const { authenticatedUser } = useAuth()

   return useMemo(() => {
      const isAuthor =
         comment &&
         checkIsQuestionCommentAuthor(comment, {
            uid: authenticatedUser.uid,
            agoraUid: agoraUserId,
            email: authenticatedUser.email,
         })

      const showDelete = isHost || isAuthor

      return {
         showDelete,
         showOptions: showDelete,
      }
   }, [
      comment,
      authenticatedUser.uid,
      agoraUserId,
      authenticatedUser.email,
      isHost,
   ])
}

export const CommentOptionsMenu = ({
   questionId,
   handleClose,
   anchorEl,
   comment,
}: Props) => {
   const streamIsMobile = useStreamIsMobile()
   const { livestreamId } = useStreamingContext()

   const open = Boolean(anchorEl)

   const { trigger: triggerDeleteComment, isMutating: isDeletingComment } =
      useDeleteLivestreamQuestionComment(
         livestreamService.getLivestreamRef(livestreamId),
         questionId,
         comment?.id
      )

   const { showDelete } = useCommentVisibilityControls(comment)

   const getOptions = () => {
      const options: MenuOption[] = []

      if (showDelete) {
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
