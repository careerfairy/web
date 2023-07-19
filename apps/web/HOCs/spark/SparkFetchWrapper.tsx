import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import useGroupSpark from "components/custom-hook/sparks/useGroupSpark"
import { FC, ReactNode } from "react"

/**
 * Props for SparkFetcher component.
 * @typedef {Object} SparkFetcherProps
 * @property {string} groupId - The ID of the group.
 * @property {string} [sparkId] - The ID of the selected Spark.
 * @property {(spark: Spark | null) => ReactNode} children - A function that returns a ReactNode, given a Spark.
 */
type SparkFetcherProps = {
   groupId: string
   sparkId?: string
   children: (spark: Spark | null) => ReactNode
}

/**
 * Fetches the Spark using the provided group and Spark IDs.
 * @param {SparkFetcherProps} props - The props for the component.
 * @returns {ReactNode} - The child components.
 */
const SparkFetcher: FC<SparkFetcherProps> = ({
   groupId,
   sparkId,
   children,
}) => {
   const spark = useGroupSpark(groupId, sparkId)
   return <>{children(spark)}</>
}

/**
 * Props for SparkFetchWrapper component.
 * @typedef {Object} WrapperProps
 * @property {boolean} shouldFetch - Indicates whether the Spark data should be fetched.
 */
type WrapperProps = {
   shouldFetch: boolean
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
   shouldFetch,
   groupId,
   sparkId,
   children,
}) => {
   if (shouldFetch) {
      return (
         <SparkFetcher groupId={groupId} sparkId={sparkId}>
            {children}
         </SparkFetcher>
      )
   } else {
      return <>{children(null)}</>
   }
}

export default SparkFetchWrapper
