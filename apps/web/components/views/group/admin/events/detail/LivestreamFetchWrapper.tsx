import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import FirestoreConditionalDocumentFetcher, {
   WrapperProps,
} from "HOCs/FirestoreConditionalDocumentFetcher"
import { FC, ReactNode } from "react"

type LivestreamFetchWrapperProps = {
   livestreamId: string
   children: (livestream: LivestreamEvent | null) => ReactNode
}

const LivestreamFetchWrapper: FC<
   WrapperProps & LivestreamFetchWrapperProps
> = ({ livestreamId, children }) => {
   const pathSegments = [livestreamId]

   return (
      <FirestoreConditionalDocumentFetcher
         shouldFetch={Boolean(livestreamId)}
         collection={"livestreams"}
         pathSegments={pathSegments}
      >
         {(livestreamDocument) => {
            if (!livestreamDocument) {
               return (
                  <FirestoreConditionalDocumentFetcher
                     shouldFetch={Boolean(livestreamId)}
                     collection={"draftLivestreams"}
                     pathSegments={pathSegments}
                  >
                     {children}
                  </FirestoreConditionalDocumentFetcher>
               )
            }
            return children(livestreamDocument as LivestreamEvent)
         }}
      </FirestoreConditionalDocumentFetcher>
   )
}

export default LivestreamFetchWrapper
