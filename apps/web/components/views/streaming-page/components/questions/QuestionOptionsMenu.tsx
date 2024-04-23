import {
   LivestreamQuestion,
   checkIsQuestionAuthor,
} from "@careerfairy/shared-lib/livestreams"
import { useAuth } from "HOCs/AuthProvider"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import BrandedResponsiveMenu, {
   MenuOption,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { Trash2 as DeleteIcon, RefreshCw } from "react-feather"
import { useStreamingContext } from "../../context"
import { useDeleteLivestreamQuestion } from "components/custom-hook/streaming/useDeleteLivestreamQuestion"
import { useResetLivestreamQuestion } from "components/custom-hook/streaming/useResetLivestreamQuestion"
import { livestreamService } from "data/firebase/LivestreamService"
import { useMemo } from "react"

type Props = {
   handleClose: () => void
   question: LivestreamQuestion
   anchorEl: HTMLElement
}

/**
 * Controls the visibility of the options menu and its options
 */
export const useQuestionsVisibilityControls = (
   question: LivestreamQuestion
) => {
   const { isHost, agoraUserId } = useStreamingContext()
   const { authenticatedUser } = useAuth()

   return useMemo(() => {
      const isAuthor =
         question &&
         checkIsQuestionAuthor(question, {
            email: authenticatedUser.email,
            uid: authenticatedUser.uid,
            agoraUid: agoraUserId,
         })

      const showReset =
         isHost &&
         question &&
         (question.type === "current" || question.type === "done")

      const showDelete = isHost || isAuthor

      return {
         showReset,
         showDelete,
         showOptions: showReset || showDelete,
      }
   }, [
      question,
      authenticatedUser.email,
      authenticatedUser.uid,
      agoraUserId,
      isHost,
   ])
}

export const QuestionOptionsMenu = ({
   question,
   handleClose,
   anchorEl,
}: Props) => {
   const open = Boolean(anchorEl)
   const streamIsMobile = useStreamIsMobile()
   const { livestreamId, streamerAuthToken } = useStreamingContext()

   const { trigger: triggerDeleteQuestion, isMutating: isDeletingQuestion } =
      useDeleteLivestreamQuestion(
         livestreamService.getLivestreamRef(livestreamId),
         question?.id
      )

   const { trigger: triggerResetQuestion, isMutating: isResettingQuestion } =
      useResetLivestreamQuestion(livestreamId, question?.id, streamerAuthToken)

   const { showReset, showDelete } = useQuestionsVisibilityControls(question)

   const isMutating = isDeletingQuestion || isResettingQuestion

   const getOptions = () => {
      const options: MenuOption[] = []

      if (!question) {
         return options
      }

      if (showReset) {
         options.push({
            label: "Reset state",
            icon: <RefreshCw />,
            handleClick: () => triggerResetQuestion(),
            loading: isMutating,
         })
      }

      if (showDelete) {
         options.push({
            label: "Delete question",
            icon: <DeleteIcon />,
            handleClick: () => triggerDeleteQuestion(),
            loading: isMutating,
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
