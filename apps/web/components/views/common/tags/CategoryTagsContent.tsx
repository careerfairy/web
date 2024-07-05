import {
   TagValuesLookup,
   groupTags,
} from "@careerfairy/shared-lib/constants/tags"
import { sxStyles } from "@careerfairy/shared-ui"
import { Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamsByTags } from "components/custom-hook/tags/useLivestreamsByTags"
import { useSparksByTags } from "components/custom-hook/tags/useSparksByTags"

import LivestreamTagsContent from "./content/LivestreamTagsContent"
import SparksTagsContent from "./content/SparksTagsContent"

const EVENTS_PER_BATCH = 3
const SPARKS_PER_BATCH = 10

const styles = sxStyles({
   wrapper: {
      transition: (theme) => theme.transitions.create(["opacity"]),
   },
})
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
   const selectedCategories = Object.keys(categories).filter(
      (cat) => categories[cat].selected
   )
   const tags = groupTags(selectedCategories)

   const {
      data: pastEvents,
      setSize: setNextPagePast,
      hasMorePages: hasMorePagesPast,
   } = useLivestreamsByTags("past", tags, EVENTS_PER_BATCH)

   const {
      data: upcomingEvents,
      setSize: setNextPageFuture,
      hasMorePages: hasMorePagesFuture,
   } = useLivestreamsByTags("future", tags, EVENTS_PER_BATCH)

   // No need to use setSize for next page, since the sparks to be fetched is
   // capped to 10 items.
   const { data: sparks } = useSparksByTags(tags, SPARKS_PER_BATCH)

   // Allows usage even if multiple selection is allowed
   const selectedTagLabel = selectedCategories
      .map((cat) => TagValuesLookup[cat])
      .join(", ")

   return (
      <Stack sx={styles.wrapper} spacing={3}>
         <SparksTagsContent
            sparks={sparks}
            selectTagIds={selectedCategories}
            selectedTagLabel={selectedTagLabel}
         />
         <LivestreamTagsContent
            title={"Upcoming live streams related to " + selectedTagLabel}
            events={upcomingEvents}
            seeMoreDisabled={!hasMorePagesFuture}
            onSeeMore={() =>
               setNextPageFuture((previousSize) => previousSize + 1)
            }
         />
         <LivestreamTagsContent
            title={"Top " + selectedTagLabel + " recordings"}
            events={pastEvents}
            seeMoreDisabled={!hasMorePagesPast}
            onSeeMore={() =>
               setNextPagePast((previousSize) => previousSize + 1)
            }
         />
      </Stack>
   )
}

const CategoryTagsContentSkeleton = () => {
   return <></>
}

export default CategoryTagsContent
