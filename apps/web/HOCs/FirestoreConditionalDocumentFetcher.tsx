import { ReactNode } from "react"
import { useFirestoreDocument } from "components/custom-hook/utils/useFirestoreDocument"
import { Identifiable } from "@careerfairy/shared-lib/commonTypes"

/**
 * Props for FirestoreFetcher component.
 */
type FirestoreFetcherProps<T extends Identifiable> = {
   collection: string
   pathSegments: string[]
   // eslint-disable-next-line no-unused-vars
   children: (data: T | null) => ReactNode
}

/**
 * Fetches the Firestore document using the provided path segments.
 */
const FirestoreFetcher = <T extends Identifiable>({
   collection,
   pathSegments,
   children,
}: FirestoreFetcherProps<T>) => {
   const { data } = useFirestoreDocument<T>(collection, pathSegments, {
      idField: "id",
   })
   return <>{children(data)}</>
}

/**
 * Props for FirestoreConditionalDocumentFetcher component.
 */
export type WrapperProps = {
   shouldFetch?: boolean
   fallbackComponent?: () => ReactNode
}

/**
 * FirestoreConditionalDocumentFetcher is a Higher Order Component (HOC) that encapsulates
 * the FirestoreFetcher component. It conditionally fetches a Firestore document based on the
 * 'shouldFetch' prop. This is necessary due to certain limitations in ReactFire.
 *
 * @param {boolean} shouldFetch - Determines whether the Firestore document should be fetched.
 * @param {string} collection - The Firestore collection to fetch the document from.
 * @param {string[]} pathSegments - The path segments to the Firestore document.
 * @param {ReactNode} children - The children to be rendered by this component.
 * @param {() => ReactNode} fallbackComponent - The component to render if 'shouldFetch' is false.
 */
const FirestoreConditionalDocumentFetcher = <T extends Identifiable>({
   shouldFetch,
   collection,
   pathSegments,
   children,
   fallbackComponent,
}: WrapperProps & FirestoreFetcherProps<T>) => {
   if (shouldFetch) {
      return (
         <FirestoreFetcher collection={collection} pathSegments={pathSegments}>
            {children}
         </FirestoreFetcher>
      )
   } else {
      return fallbackComponent ? fallbackComponent() : <>{children(null)}</>
   }
}

export default FirestoreConditionalDocumentFetcher
