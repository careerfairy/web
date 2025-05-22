import useLivestream from "components/custom-hook/live-stream/useLivestream"
import LivestreamDialog, {
   AllDialogSettings,
} from "components/views/livestream-dialog/LivestreamDialog"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useModuleId } from "store/selectors/talentGuideSelectors"

type Props = {
   isLiveStreamDialogOpen: boolean
   handleLiveStreamDialogClose: () => void
   currentLiveStreamIdInDialog: string
   getLiveStreamDialogKey: () => string
}

const Dialog = ({
   isLiveStreamDialogOpen,
   handleLiveStreamDialogClose,
   currentLiveStreamIdInDialog,
   getLiveStreamDialogKey,
}: Props) => {
   const router = useRouter()
   const { data: livestream } = useLivestream(currentLiveStreamIdInDialog)
   const moduleId = useModuleId()

   useEffect(() => {
      if (!router.query.dialogLiveStreamId && isLiveStreamDialogOpen) {
         handleLiveStreamDialogClose()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.query.dialogLiveStreamId])

   if (!livestream) return null

   return (
      <LivestreamDialog
         key={getLiveStreamDialogKey()}
         open={isLiveStreamDialogOpen}
         livestreamId={livestream.id}
         serverSideLivestream={livestream}
         handleClose={handleLiveStreamDialogClose}
         initialPage={"details"}
         mode="stand-alone"
         providedOriginSource={`talent-guide-module-${moduleId}-livestream-${livestream.id}`}
         serverUserEmail={""}
         setting={AllDialogSettings.Levels}
      />
   )
}

export const LiveStreamDialogExtended = ({
   currentLiveStreamIdInDialog,
   ...props
}: Props) => {
   // So we don't run into runtime errors when trying
   // to fetch data of an undefined live stream id
   if (!currentLiveStreamIdInDialog) return null

   return (
      <Dialog
         currentLiveStreamIdInDialog={currentLiveStreamIdInDialog}
         {...props}
      />
   )
}
