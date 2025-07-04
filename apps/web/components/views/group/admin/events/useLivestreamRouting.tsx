import {
   AuthorInfo,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { useAuth } from "HOCs/AuthProvider"
import { buildLivestreamObject } from "components/helperFunctions/streamFormFunctions"
import { getLivestreamInitialValues } from "components/views/draftStreamForm/DraftStreamForm"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import {
   feedbackQuestionFormInitialValues,
   mapFeedbackQuestionToRatings,
} from "./detail/form/views/questions/commons"

export const useLivestreamRouting = () => {
   const { group } = useGroup()
   const router = useRouter()
   const firebase = useFirebaseService()
   const { authenticatedUser } = useAuth()

   const [isCreating, setIsCreating] = useState(false)

   const handleCreateDraftLivestream = async () => {
      setIsCreating(true)

      const author: AuthorInfo = {
         groupId: group.id,
         authUid: authenticatedUser.uid,
      }

      const initialValues = getLivestreamInitialValues(group)
      const draftLivestream: LivestreamEvent = buildLivestreamObject(
         initialValues,
         false,
         null,
         firebase
      )

      draftLivestream.groupIds = [group.id]
      draftLivestream.speakers = []

      const initialFeedbackQuestions = feedbackQuestionFormInitialValues.map(
         (question) =>
            mapFeedbackQuestionToRatings(question, draftLivestream.duration)
      )

      try {
         const draftLiveStreamId = await firebase.addLivestream(
            draftLivestream,
            "draftLivestreams",
            author,
            initialFeedbackQuestions
         )

         return router.push({
            pathname: `/group/${group.id}/admin/content/live-streams/${draftLiveStreamId}`,
         })
      } catch (error) {
         errorLogAndNotify(error, {
            message: "Failed to create draft stream",
            groupId: group.id,
         })
      } finally {
         setIsCreating(false)
      }
   }

   const editLivestream = (livestreamId: string) => {
      return router.push({
         pathname: `/group/${group.id}/admin/content/live-streams/${livestreamId}`,
      })
   }

   return {
      editLivestream,
      createDraftLivestream: handleCreateDraftLivestream,
      isCreating,
   }
}
