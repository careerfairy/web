import { groupTags } from "@careerfairy/shared-lib/constants/tags"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { UpcomingLivestreamTagsContent } from "./content/LivestreamTagsContent"

type Props = {
   categories: {
      [id: string]: {
         selected: boolean
      }
   }
}
const CategoryTagsContent = (props: Props) => {
   return (
      <SuspenseWithBoundary fallback={<CategoryTagsContentSkeleton />}>
         <CategoryTagsContentComponent categories={props.categories} />
      </SuspenseWithBoundary>
   )
}
const CategoryTagsContentComponent = ({ categories }: Props) => {
   const tags = groupTags(
      Object.keys(categories).filter((cat) => categories[cat].selected)
   )

   // TODO: pass limits independantly and use see more to increment
   return (
      <>
         <UpcomingLivestreamTagsContent tags={tags} />
      </>
   )
}

const CategoryTagsContentSkeleton = () => {
   return (
      <>
         <h1>TODO SKELETON</h1>
      </>
   )
}

export default CategoryTagsContent
