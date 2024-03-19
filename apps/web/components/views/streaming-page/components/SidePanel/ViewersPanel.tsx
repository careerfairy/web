import { Fragment } from "react"
import { SidePanelView } from "./SidePanelView"

import { Box, CircularProgress } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useParticipatingUsers } from "components/custom-hook/streaming/useParticipatingUsers"
import { Eye } from "react-feather"
import {
   useCurrentViewCount,
   useFailedToConnectToRTM,
} from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { useRTMChannel } from "../../context/rtm"
import { useChannelMembers } from "../../context/rtm/hooks/useChannelMembers"
import { GenericListRenderer } from "./GenericListRenderer"

const styles = sxStyles({
   contentWrapper: {
      p: 0,
   },
   viewer: {
      py: 1,
      px: 2,
   },
   loader: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
   },
})

export const ViewersPanel = () => {
   const viewCount = useCurrentViewCount()
   const failedToConnectToRTM = useFailedToConnectToRTM()

   return (
      <SidePanelView
         id="viewer-panel"
         title={
            <Fragment>
               Viewers:{" "}
               <Box component="span" fontWeight={600}>
                  {viewCount}
               </Box>
            </Fragment>
         }
         icon={<Eye />}
         contentWrapperStyles={styles.contentWrapper}
      >
         <SuspenseWithBoundary fallback={<Loader />}>
            {failedToConnectToRTM ? (
               <AllAttendees />
            ) : (
               <CurrentRTMChanneLMembers />
            )}
         </SuspenseWithBoundary>
      </SidePanelView>
   )
}

const Loader = () => (
   <Box sx={styles.loader}>
      <CircularProgress />
   </Box>
)

const AllAttendees = () => {
   const { livestreamId } = useStreamingContext()
   const { data: users } = useParticipatingUsers(livestreamId)

   return (
      <GenericListRenderer items={users || []} itemKey={(item) => item.id} />
   )
}

const CurrentRTMChanneLMembers = () => {
   const rtmChannel = useRTMChannel()
   const { members } = useChannelMembers(rtmChannel)

   return <GenericListRenderer items={members || []} itemKey={(item) => item} />
}
