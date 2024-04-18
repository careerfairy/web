import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import FirestoreConditionalDocumentFetcher, {
   WrapperProps,
} from "HOCs/FirestoreConditionalDocumentFetcher"
import { ReactNode } from "react"

type LivestreamFetchWrapperProps = {
   livestreamId: string
   children: (livestream: LivestreamEvent | null) => ReactNode
}

const LivestreamFetchWrapper = ({
   livestreamId,
   children,
}: WrapperProps & LivestreamFetchWrapperProps) => {
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
                     {(draftLivestreamDocument) => {
                        // eslint-disable-next-line no-extra-semi
                        ;(draftLivestreamDocument as LivestreamEvent).isDraft =
                           true

                        return children(
                           draftLivestreamDocument as LivestreamEvent
                        )
                     }}
                  </FirestoreConditionalDocumentFetcher>
               )
            }
            // eslint-disable-next-line no-extra-semi
            ;(livestreamDocument as LivestreamEvent).isDraft = false
            return children(livestreamDocument as LivestreamEvent)
         }}
      </FirestoreConditionalDocumentFetcher>
   )
}

export default LivestreamFetchWrapper
