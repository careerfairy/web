import { getMetaDataFromEventHosts } from "@careerfairy/shared-lib/livestreams/metadata"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useLivestreamDialog } from "layouts/GroupDashboardLayout/useLivestreamDialog"
import { useSnackbar } from "notistack"
import { useCallback } from "react"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import { mapFormValuesToLivestreamObject } from "./commons"
import { useLivestreamFormValues } from "./useLivestreamFormValues"

export const usePublishLivestream = () => {
   const firebaseService = useFirebaseService()
   const { values, isValid } = useLivestreamFormValues()
   const { livestream } = useLivestreamCreationContext()
   const { group } = useGroup()
   const { isPublishing, handlePublishStream } = useLivestreamDialog(group)
   const { enqueueSnackbar } = useSnackbar()

   const publishLivestream = useCallback(async () => {
      if (!isValid) {
         enqueueSnackbar("Form is invalid, please fix errors first.", {
            variant: "error",
         })
         return
      }

      const livestreamObject = mapFormValuesToLivestreamObject(
         values,
         firebaseService
      )
      livestreamObject.id = livestream.id
      livestreamObject.test = false
      livestreamObject.hasEnded = false
      livestreamObject.questionsDisabled = false
      livestreamObject.denyRecordingAccess = false
      livestreamObject.type = "upcoming"

      const metaData = getMetaDataFromEventHosts(values.questions.hosts)
      if (metaData) {
         livestreamObject.companySizes = metaData.companySizes
         livestreamObject.companyIndustries = metaData.companyIndustries
         livestreamObject.companyCountries = metaData.companyCountries
      }

      return handlePublishStream(livestreamObject, {})
   }, [
      enqueueSnackbar,
      firebaseService,
      handlePublishStream,
      isValid,
      livestream.id,
      values,
   ])

   return { isPublishing, publishLivestream }
}
