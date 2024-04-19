import {
   LivestreamQuestion,
   hasUpvotedLivestreamQuestion,
} from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import { useAuth } from "HOCs/AuthProvider"
import { ThumbsUp } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { useToggleUpvoteLivestreamQuestion } from "components/custom-hook/streaming/useToggleUpvoteLivestreamQuestion"

const styles = sxStyles({
   root: {
      p: 0,
      borderRadius: 2,
      fontSize: "16px",
      minWidth: "auto",
      minHeight: "auto",
      lineHeight: 1.5,
      "& .MuiButton-startIcon": {
         marginRight: 1.25,
         ml: 0,
      },
      "& svg": {
         width: "14.762px",
         height: "15px",
      },
   },
})

type Props = {
   question: LivestreamQuestion
}

export const ToggleUpvoteButton = ({ question }: Props) => {
   const { authenticatedUser } = useAuth()
   const { streamRef, agoraUserId } = useStreamingContext()

   const identifiers = {
      email: authenticatedUser?.email,
      uid: authenticatedUser?.uid || agoraUserId,
   }

   const hasUpvoted = hasUpvotedLivestreamQuestion(question, identifiers)

   const { trigger: toggleUpvote, isMutating: isTogglingUpvote } =
      useToggleUpvoteLivestreamQuestion(streamRef, question.id, identifiers)

   return (
      <LoadingButton
         startIcon={<ThumbsUp />}
         size="small"
         onClick={toggleUpvote}
         loading={isTogglingUpvote}
         variant="text"
         disableRipple
         color={hasUpvoted ? "primary" : "grey"}
         sx={styles.root}
      >
         {question.votes || 0} likes
      </LoadingButton>
   )
}
