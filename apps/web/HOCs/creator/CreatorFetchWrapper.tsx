import { Creator } from "@careerfairy/shared-lib/groups/creators"
import useGroupCreator from "components/custom-hook/creator/useGroupCreator"
import { FC, ReactNode } from "react"

/**
 * Props for CreatorFetcher component.
 * @typedef {Object} CreatorFetcherProps
 * @property {string} groupId - The ID of the group.
 * @property {string} [selectedCreatorId] - The ID of the selected creator.
 * @property {(creator: Creator | null) => ReactNode} children - A function that returns a ReactNode, given a creator.
 */
type CreatorFetcherProps = {
   groupId: string
   selectedCreatorId?: string
   children: (creator: Creator | null) => ReactNode
}

/**
 * Fetches the creator using the provided group and creator IDs.
 * @param {CreatorFetcherProps} props - The props for the component.
 * @returns {ReactNode} - The child components.
 */
const CreatorFetcher: FC<CreatorFetcherProps> = ({
   groupId,
   selectedCreatorId,
   children,
}) => {
   const { data: creator } = useGroupCreator(groupId, selectedCreatorId)
   return <>{children(creator)}</>
}

/**
 * Props for CreatorFetchWrapper component.
 * @typedef {Object} WrapperProps
 * @property {boolean} shouldFetch - Indicates whether the creator data should be fetched.
 */
type WrapperProps = {
   shouldFetch: boolean
}

/**
 * A Higher Order Component (HOC) that wraps around the CreatorFetcher component and conditionally fetches the creator data.
 * This component provides a level of abstraction to handle conditional rendering based on the `shouldFetch` prop.
 * If `shouldFetch` is true, it will render the CreatorFetcher component which in turn fetches data using the reactfire-based hook.
 * Otherwise, it simply renders children with null data, ensuring the hook is not called with undefined arguments or else it will throw an error.
 * @param {WrapperProps & CreatorFetcherProps} props - The props for the component.
 * @returns {ReactNode} - The child components.
 */
const CreatorFetchWrapper: FC<WrapperProps & CreatorFetcherProps> = ({
   shouldFetch,
   groupId,
   selectedCreatorId,
   children,
}) => {
   if (shouldFetch) {
      return (
         <CreatorFetcher
            groupId={groupId}
            selectedCreatorId={selectedCreatorId}
         >
            {children}
         </CreatorFetcher>
      )
   } else {
      return <>{children(null)}</>
   }
}

export default CreatorFetchWrapper
