import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import FirestoreConditionalDocumentFetcher, {
   WrapperProps,
} from "HOCs/FirestoreConditionalDocumentFetcher"
import { ReactNode } from "react"

type OfflineEventFetchWrapperProps = {
   offlineEventId: string
   children: (offlineEvent: OfflineEvent | null) => ReactNode
} & WrapperProps

const OfflineEventFetchWrapper = ({
   offlineEventId,
   children,
}: OfflineEventFetchWrapperProps) => {
   const pathSegments = [offlineEventId]

   return (
      <FirestoreConditionalDocumentFetcher
         shouldFetch={Boolean(offlineEventId)}
         collection={"offlineEvents"}
         pathSegments={pathSegments}
      >
         {(offlineEventDocument: OfflineEvent | null) =>
            children(offlineEventDocument)
         }
      </FirestoreConditionalDocumentFetcher>
   )
}

export default OfflineEventFetchWrapper
