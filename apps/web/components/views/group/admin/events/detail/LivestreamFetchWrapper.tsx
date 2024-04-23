import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import FirestoreConditionalDocumentFetcher, {
   WrapperProps,
} from "HOCs/FirestoreConditionalDocumentFetcher"
import { ReactNode } from "react"

type LivestreamFetchWrapperProps = {
   livestreamId: string
   children: (livestream: LivestreamEvent | null) => ReactNode
} & WrapperProps

const LivestreamFetchWrapper = ({
   livestreamId,
   children,
}: LivestreamFetchWrapperProps) => {
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
                        if (!draftLivestreamDocument) {
                           return null
                        }

                        const document = {
                           ...draftLivestreamDocument,
                           isDraft: true,
                        } as LivestreamEvent

                        return children(document)
                     }}
                  </FirestoreConditionalDocumentFetcher>
               )
            }
            const document = {
               ...livestreamDocument,
               isDraft: false,
            } as LivestreamEvent

            return children(document)
         }}
      </FirestoreConditionalDocumentFetcher>
   )
}

export default LivestreamFetchWrapper
