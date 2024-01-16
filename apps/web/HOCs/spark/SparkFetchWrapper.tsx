import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import FirestoreConditionalDocumentFetcher, {
   WrapperProps,
} from "HOCs/FirestoreConditionalDocumentFetcher"
import { FC, ReactNode } from "react"

/**
 * Props for SparkFetcher component.
 * @property {string} [sparkId] - The ID of the selected Spark.
 * @property {(spark: Spark | null) => ReactNode} children - A function that returns a ReactNode, given a Spark.
 */
type SparkFetcherProps = {
   sparkId: string
   children: (spark: Spark | null) => ReactNode
}

/**
 * A Higher Order Component (HOC) that wraps around the SparkFetcher component and conditionally fetches the Spark data.
 * This component provides a level of abstraction to handle conditional rendering based on the `shouldFetch` prop.
 * If `shouldFetch` is true, it will render the SparkFetcher component which in turn fetches data using the reactfire-based hook.
 * Otherwise, it simply renders children with null data, ensuring the hook is not called with undefined arguments or else it will throw an error.
 * @param {WrapperProps & SparkFetcherProps} props - The props for the component.
 * @returns {ReactNode} - The child components.
 */
const SparkFetchWrapper: FC<WrapperProps & SparkFetcherProps> = ({
   sparkId,
   children,
   fallbackComponent,
}) => {
   const collection = "sparks"
   const pathSegments = [sparkId]

   return (
      <FirestoreConditionalDocumentFetcher
         collection={collection}
         pathSegments={pathSegments}
         shouldFetch={Boolean(sparkId)}
         fallbackComponent={fallbackComponent}
      >
         {children}
      </FirestoreConditionalDocumentFetcher>
   )
}

export default SparkFetchWrapper
