import { FC, ReactNode } from "react"
import FirestoreConditionalDocumentFetcher, {
   WrapperProps,
} from "HOCs/FirestoreConditionalDocumentFetcher"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

type LivestreamFetchWrapperProps = {
   livestreamId: string
   children: (livestream: LivestreamEvent | null) => ReactNode
}

const LivestreamFetchWrapper: FC<
   WrapperProps & LivestreamFetchWrapperProps
> = ({ livestreamId, children }) => {
   const collection = "livestreams"
   const pathSegments = [livestreamId]

   return (
      <FirestoreConditionalDocumentFetcher
         shouldFetch={Boolean(livestreamId)}
         collection={collection}
         pathSegments={pathSegments}
      >
         {children}
      </FirestoreConditionalDocumentFetcher>
   )
}

export default LivestreamFetchWrapper
