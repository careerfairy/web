import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import useGroupCreator from "components/custom-hook/creator/useGroupCreator"
import useGroupSpark from "components/custom-hook/sparks/useGroupSpark"
import { FC, ReactNode, useMemo } from "react"

type ReturnType = {
   spark: Spark | null
   creator: Creator | null
}
/**
 * Props for SparkAndCreatorFetcher component.
 * @typedef {Object} SparkAndCreatorFetcherProps
 * @property {string} groupId - The ID of the group.
 * @property {string} [sparkId] - The ID of the selected SparkAndCreatorFetcher.
 * @property {(SparkAndCreatorFetcher: ReturnType) => ReactNode} children - A function that returns a ReactNode, given a SparkAndCreatorFetcher.
 */
type SparkAndCreatorFetcherProps = {
   groupId: string
   sparkId?: string
   creatorId?: string
   children: (SparkAndCreatorFetcher: ReturnType) => ReactNode
}

/**
 * Fetches the SparkAndCreatorFetcher using the provided group and SparkAndCreatorFetcher IDs.
 * @param {SparkAndCreatorFetcherProps} props - The props for the component.
 * @returns {ReactNode} - The child components.
 */
const SparkAndCreatorFetcher: FC<SparkAndCreatorFetcherProps> = ({
   groupId,
   sparkId,
   creatorId,
   children,
}) => {
   const spark = useGroupSpark(groupId, sparkId)
   const { data: creator } = useGroupCreator(groupId, creatorId)

   const data = useMemo<ReturnType>(() => {
      return {
         spark,
         creator,
      }
   }, [spark, creator])

   return <>{children(data)}</>
}

/**
 * Props for SparkAndCreatorFetcherFetchWrapper component.
 * @typedef {Object} WrapperProps
 * @property {boolean} shouldFetch - Indicates whether the SparkAndCreatorFetcher data should be fetched.
 */
type WrapperProps = {
   shouldFetch: boolean
}

/**
 * A Higher Order Component (HOC) that wraps around the SparkAndCreatorFetcher component and conditionally fetches the SparkAndCreatorFetcher data.
 * This component provides a level of abstraction to handle conditional rendering based on the `shouldFetch` prop.
 * If `shouldFetch` is true, it will render the SparkAndCreatorFetcher component which in turn fetches data using the reactfire-based hook.
 * Otherwise, it simply renders children with null data, ensuring the hook is not called with undefined arguments or else it will throw an error.
 * @param {WrapperProps & SparkAndCreatorFetcherProps} props - The props for the component.
 * @returns {ReactNode} - The child components.
 */
const SparkAndCreatorFetchWrapper: FC<
   WrapperProps & SparkAndCreatorFetcherProps
> = ({ shouldFetch, groupId, sparkId: SparkAndCreatorFetcherId, children }) => {
   if (shouldFetch) {
      return (
         <SparkAndCreatorFetcher
            groupId={groupId}
            sparkId={SparkAndCreatorFetcherId}
         >
            {children}
         </SparkAndCreatorFetcher>
      )
   } else {
      return <>{children(null)}</>
   }
}

export default SparkAndCreatorFetchWrapper
