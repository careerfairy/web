import { GroupOption } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useFieldsOfStudy } from "components/custom-hook/useCollection"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useLivestreamDialog } from "layouts/GroupDashboardLayout/useLivestreamDialog"
import { useSnackbar } from "notistack"
import { useCallback } from "react"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import { mapFormValuesToLivestreamObject } from "./commons"
import { useLivestreamFormValues } from "./useLivestreamFormValues"
import { mapFeedbackQuestionToRatings } from "./views/questions/commons"

export const usePublishLivestream = () => {
   const firebaseService = useFirebaseService()
   const { values, isValid } = useLivestreamFormValues()
   const { livestream } = useLivestreamCreationContext()
   const { group } = useGroup()
   const { isPublishing, handlePublishStream } = useLivestreamDialog(group)
   const { enqueueSnackbar } = useSnackbar()
   const { data: allFieldsOfStudy } = useFieldsOfStudy()

   const publishLivestream = useCallback(async () => {
      if (!isValid) {
         enqueueSnackbar("Form is invalid, please fix errors first.", {
            variant: "error",
         })
         return
      }

      const livestreamObject: Partial<LivestreamEvent> =
         mapFormValuesToLivestreamObject(
            values,
            allFieldsOfStudy,
            firebaseService
         )
      livestreamObject.id = livestream.id
      livestreamObject.test = false
      livestreamObject.hasEnded = false
      livestreamObject.questionsDisabled = false
      livestreamObject.denyRecordingAccess = false
      livestreamObject.type = "upcoming"
      livestreamObject.companyCountries = [group.companyCountry?.id || ""]
      livestreamObject.companyIndustries =
         group.companyIndustries?.map(
            (industry: GroupOption) => industry?.id
         ) || []

      const ratings = values.questions.feedbackQuestions
         .filter(
            (question) =>
               question.question && question.type && question.appearAfter
         )
         .filter((question) => !question.deleted)
         .map((question) =>
            mapFeedbackQuestionToRatings(question, livestreamObject.duration)
         )

      return handlePublishStream(livestreamObject as LivestreamEvent, ratings)
   }, [
      allFieldsOfStudy,
      enqueueSnackbar,
      firebaseService,
      group.companyCountry?.id,
      group.companyIndustries,
      handlePublishStream,
      isValid,
      livestream.id,
      values,
   ])

   return { isPublishing, publishLivestream }
}
