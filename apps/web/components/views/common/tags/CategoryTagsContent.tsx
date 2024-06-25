import { groupTags } from "@careerfairy/shared-lib/constants/tags"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamsByTags } from "components/custom-hook/tags/useLivestreamsByTags"
import { useSparksByTags } from "components/custom-hook/tags/useSparksByTags"
import { useMemo, useState } from "react"
import {
   PastLivestreamTagsContent,
   UpcomingLivestreamTagsContent,
} from "./content/LivestreamTagsContent"
import SparksTagsContent from "./content/SparksTagsContent"

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
   const [pastEventsLimit, setPastEventsLimit] = useState(6)
   console.log(
      "🚀 ~ CategoryTagsContentComponent ~ pastEventsLimit:",
      pastEventsLimit
   )
   const [upcomingEventsLimit, setUpcomingEventsLimit] = useState(6)

   const tags = useMemo(() => {
      return groupTags(
         Object.keys(categories).filter((cat) => categories[cat].selected)
      )
   }, [categories])

   const { data: pastEvents } = useLivestreamsByTags(
      "pastEvents",
      tags,
      pastEventsLimit
   )
   const { data: upcomingEvents } = useLivestreamsByTags(
      "upcomingEvents",
      tags,
      upcomingEventsLimit
   )
   const { data: sparks } = useSparksByTags(tags)

   // TODO: pass limits independantly and use see more to increment
   return (
      <>
         <SparksTagsContent sparks={sparks} />
         <UpcomingLivestreamTagsContent
            events={upcomingEvents}
            onSeeMore={() => {
               setPastEventsLimit(pastEventsLimit + 6)
            }}
         />
         <PastLivestreamTagsContent
            events={pastEvents}
            onSeeMore={() => {
               setUpcomingEventsLimit(upcomingEventsLimit + 6)
            }}
         />
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
