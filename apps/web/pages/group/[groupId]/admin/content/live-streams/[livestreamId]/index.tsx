import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import useAdminGroup from "components/custom-hook/useAdminGroup"
import { useFeatureFlags } from "components/custom-hook/useFeatureFlags"
import { BackToStreamsHeader } from "components/views/group/admin/events/detail/BackToStreamsHeader"
import LivestreamForm from "components/views/group/admin/events/detail/form/LivestreamForm"
import LivestreamFormikProvider from "components/views/group/admin/events/detail/form/LivestreamFormikProvider"
import { RecordingAutoSaveContextProvider } from "components/views/group/admin/events/detail/form/recording/RecordingAutoSaveContext"
import RecordingForm from "components/views/group/admin/events/detail/form/recording/RecordingForm"
import { RecordingFormProvider } from "components/views/group/admin/events/detail/form/recording/RecordingFormProvider"
import { RecordingTopActions } from "components/views/group/admin/events/detail/form/recording/RecordingTopActions"
import { LivestreamAutoSaveContextProvider } from "components/views/group/admin/events/detail/LivestreamAutoSaveContext"
import { LivestreamCreationContextProvider } from "components/views/group/admin/events/detail/LivestreamCreationContext"
import { LivestreamTopActions } from "components/views/group/admin/events/detail/LivestreamTopActions"
import LivestreamAdminDetailTopBarNavigation from "components/views/group/admin/events/detail/navigation/LivestreamAdminDetailTopBarNavigation"
import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { NextPage } from "next"
import { useRouter } from "next/router"
import { ReactElement, createContext, useContext } from "react"
import LivestreamFetchWrapper from "../../../../../../../components/views/group/admin/events/detail/LivestreamFetchWrapper"
import LivestreamAdminDetailBottomBarNavigation from "../../../../../../../components/views/group/admin/events/detail/navigation/LivestreamAdminDetailBottomBarNavigation"

type NextPageWithLayout = NextPage & {
   getLayout?: (page: ReactElement) => ReactElement
}

// Lightweight context to communicate recording mode to the page after fetching the livestream
const RecordingModeContext = createContext<boolean>(false)
export const useIsRecordingMode = () => useContext(RecordingModeContext)

// Livestream-only layout wrapper providing formik, creation and autosave contexts
const LivestreamLayoutWrapper = ({
   livestream,
   group,
   children,
}: {
   livestream: LivestreamEvent
   group: Group
   children: ReactElement
}) => {
   return (
      <RecordingModeContext.Provider value={false}>
         <LivestreamFormikProvider livestream={livestream} group={group}>
            <LivestreamCreationContextProvider
               livestream={livestream}
               group={group}
            >
               <LivestreamAutoSaveContextProvider>
                  {children}
               </LivestreamAutoSaveContextProvider>
            </LivestreamCreationContextProvider>
         </LivestreamFormikProvider>
      </RecordingModeContext.Provider>
   )
}

const RecordingLayoutWrapper = ({
   children,
   livestream,
}: {
   children: ReactElement
   livestream: LivestreamEvent
}) => {
   return (
      <RecordingModeContext.Provider value={true}>
         <RecordingFormProvider livestream={livestream}>
            <RecordingAutoSaveContextProvider>
               {children}
            </RecordingAutoSaveContextProvider>
         </RecordingFormProvider>
      </RecordingModeContext.Provider>
   )
}

const LivestreamAdminDetailsPage: NextPageWithLayout = () => {
   const isRecordingMode = useIsRecordingMode()
   return isRecordingMode ? <RecordingForm /> : <LivestreamForm />
}

// Layout decider: fetch first, then choose layout and providers
const LivestreamLayoutDecider = ({ page }: { page: ReactElement }) => {
   const router = useRouter()
   const { groupId, livestreamId } = router.query
   const { group } = useAdminGroup(groupId as string)
   const flags = useFeatureFlags()

   // Avoid rendering fetchers until router params and group are ready
   if (!groupId || !livestreamId || !group) {
      return null
   }

   return (
      <LivestreamFetchWrapper livestreamId={livestreamId as string}>
         {(livestream) => {
            if (!livestream) return null

            const presenter = LivestreamPresenter.createFromDocument(livestream)
            const isPast = presenter.isPast()
            const isDraft = livestream.isDraft
            const isNewRecordingsFormEnabled = flags?.newRecordingsFormFlag

            if (isNewRecordingsFormEnabled && isPast && !isDraft) {
               return withGroupDashboardLayout({
                  titleComponent: (router) => (
                     <BackToStreamsHeader
                        groupId={router.query.groupId as string}
                        isRecording
                     />
                  ),
                  topBarAction: <RecordingTopActions />,
                  backgroundColor: "#F7F8FC",
                  dashboardHeadTitle: "CareerFairy | Editing Recording of ",
                  wrapper: (layoutContent) => (
                     <RecordingLayoutWrapper livestream={livestream}>
                        {layoutContent}
                     </RecordingLayoutWrapper>
                  ),
               })(page)
            }

            return withGroupDashboardLayout({
               titleComponent: (router) => (
                  <BackToStreamsHeader
                     groupId={router.query.groupId as string}
                  />
               ),
               topBarAction: <LivestreamTopActions />,
               topBarNavigation: <LivestreamAdminDetailTopBarNavigation />,
               bottomBarNavigation: (
                  <LivestreamAdminDetailBottomBarNavigation />
               ),
               backgroundColor: "#FDFDFD",
               dashboardHeadTitle: "CareerFairy | Editing Live Stream of ",
               wrapper: (layoutContent) => (
                  <LivestreamLayoutWrapper
                     livestream={livestream}
                     group={group}
                  >
                     {layoutContent}
                  </LivestreamLayoutWrapper>
               ),
            })(page)
         }}
      </LivestreamFetchWrapper>
   )
}

LivestreamAdminDetailsPage.getLayout = function getLayout(page: ReactElement) {
   return <LivestreamLayoutDecider page={page} />
}

export default LivestreamAdminDetailsPage
