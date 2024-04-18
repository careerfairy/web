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

type Props = {
   handleClose: () => void
   question: LivestreamQuestion
   anchorEl: HTMLElement
}

export const QuestionOptionsMenu = ({
   question,
   handleClose,
   anchorEl,
}: Props) => {
   const open = Boolean(anchorEl)
   const { authenticatedUser } = useAuth()
   const streamIsMobile = useStreamIsMobile()
   const { isHost, agoraUserId, livestreamId, streamerAuthToken } =
      useStreamingContext()

   const { trigger: triggerDeleteQuestion, isMutating: isDeletingQuestion } =
      useDeleteLivestreamQuestion(
         livestreamService.getLivestreamRef(livestreamId),
         question?.id
      )

   const { trigger: triggerResetQuestion, isMutating: isResettingQuestion } =
      useResetLivestreamQuestion(livestreamId, question?.id, streamerAuthToken)

   const isMutating = isDeletingQuestion || isResettingQuestion

   const getOptions = () => {
      const options: MenuOption[] = []

      if (
         (isHost && question?.type === "current") ||
         question?.type === "done"
      ) {
         options.push({
            label: "Reset state",
            icon: <RefreshCw />,
            handleClick: () => triggerResetQuestion(),
            loading: isMutating,
         })
      }

      if (
         isHost ||
         checkIsQuestionAuthor(question, {
            email: authenticatedUser.email,
            uid: authenticatedUser.uid,
            agoraUid: agoraUserId,
         })
      ) {
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
