import { ReactNode } from "react"
import { useFirestoreDocument } from "components/custom-hook/utils/useFirestoreDocument"
import { Identifiable } from "@careerfairy/shared-lib/commonTypes"
import { ReactFireOptions } from "reactfire"

/**
 * Props for FirestoreFetcher component.
 */
type FirestoreFetcherProps<T extends Identifiable> = {
   collection: string
   pathSegments: string[]
   // eslint-disable-next-line no-unused-vars
   children: (data: T | null) => ReactNode
   options?: ReactFireOptions
}

/**
 * Fetches the Firestore document using the provided path segments.
 */
const FirestoreDocumentFetcherById = <T extends Identifiable>({
   collection,
   pathSegments,
   children,
   options,
}: FirestoreFetcherProps<T>) => {
   const { data } = useFirestoreDocument<T>(collection, pathSegments, options)
   return <>{children(data)}</>
}

/**
 * Props for FirestoreConditionalDocumentFetcher component.
 */
export type WrapperProps = {
   shouldFetch?: boolean
   fallbackComponent?: () => ReactNode
   options?: ReactFireOptions
}

/**
 * FirestoreConditionalDocumentFetcher is a Higher Order Component (HOC) that wraps
 * the FirestoreFetcher component. It fetches a Firestore document based on the
 * 'shouldFetch' prop. This is due to certain constraints in ReactFire.
 *
 * @param {boolean} shouldFetch - Determines whether the Firestore document should be fetched.
 * @param {string} collection - The Firestore collection to fetch the document from.
 * @param {string[]} pathSegments - The path segments to the Firestore document.
 * @param {ReactNode} children - The children to be rendered by this component.
 * @param {() => ReactNode} fallbackComponent - The component to render if 'shouldFetch' is false.
 * @param {ReactFireOptions} options - The options for the Firestore document fetch.
 */
const FirestoreConditionalDocumentFetcher = <T extends Identifiable>({
   shouldFetch,
   collection,
   pathSegments,
   children,
   fallbackComponent,
   options,
}: WrapperProps & FirestoreFetcherProps<T>) => {
   if (shouldFetch) {
      return (
         <FirestoreDocumentFetcherById
            collection={collection}
            pathSegments={pathSegments}
            options={options}
         >
            {children}
         </FirestoreDocumentFetcherById>
      )
   } else {
      return fallbackComponent ? fallbackComponent() : <>{children(null)}</>
   }
}

export default FirestoreConditionalDocumentFetcher
