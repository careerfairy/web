import { Creator } from "@careerfairy/shared-lib/groups/creators"
import FirestoreConditionalDocumentFetcher, {
   WrapperProps,
} from "HOCs/FirestoreConditionalDocumentFetcher"
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
   // eslint-disable-next-line no-unused-vars
   children: (creator: Creator | null) => ReactNode
}

/**
 * A Higher Order Component (HOC) that wraps around the CreatorFetcher component and conditionally fetches the creator data.
 * This component provides a level of abstraction to handle conditional rendering based on the `shouldFetch` prop.
 * If `shouldFetch` is true, it will render the CreatorFetcher component which in turn fetches data using the reactfire-based hook.
 * Otherwise, it renders the fallbackComponent if provided, or children with null data.
 * @param {WrapperProps & CreatorFetcherProps} props - The props for the component.
 * @returns {ReactNode} - The child components.
 */
const CreatorFetchWrapper: FC<WrapperProps & CreatorFetcherProps> = ({
   groupId,
   selectedCreatorId,
   children,
   fallbackComponent,
}) => {
   const collection = "careerCenterData"
   const pathSegments = [groupId, "creators", selectedCreatorId]

   return (
      <FirestoreConditionalDocumentFetcher
         shouldFetch={Boolean(selectedCreatorId)}
         collection={collection}
         pathSegments={pathSegments}
         fallbackComponent={fallbackComponent}
      >
         {children}
      </FirestoreConditionalDocumentFetcher>
   )
}

export default CreatorFetchWrapper
