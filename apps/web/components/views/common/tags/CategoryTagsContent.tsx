import {
   TagValuesLookup,
   groupTags,
} from "@careerfairy/shared-lib/constants/tags"
import { sxStyles } from "@careerfairy/shared-ui"
import { Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"

import ConditionalWrapper from "components/util/ConditionalWrapper"
import LivestreamTagsContent from "./content/LivestreamTagsContent"
import SparksTagsContent from "./content/SparksTagsContent"

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

   const hasBusinessFunctions = Boolean(
      Object.keys(tags.businessFunctions).length
   )
   const hasContentTopics = Boolean(Object.keys(tags.contentTopics).length)
   const hasLanguages = Boolean(Object.keys(tags.language).length)

   // Allows usage even if multiple selection is allowed
   const selectedTagLabel = selectedCategories
      .map((cat) => TagValuesLookup[cat])
      .join(", ")

   return (
      <Stack sx={styles.wrapper} spacing={3}>
         <ConditionalWrapper condition={hasContentTopics || hasLanguages}>
            <SparksTagsContent
               tags={tags}
               selectTagIds={selectedCategories}
               selectedTagLabel={selectedTagLabel}
            />
         </ConditionalWrapper>
         <ConditionalWrapper
            condition={hasBusinessFunctions || hasContentTopics || hasLanguages}
         >
            <LivestreamTagsContent
               title={"Upcoming live streams related to " + selectedTagLabel}
               type="future"
               tags={tags}
            />
            <LivestreamTagsContent
               title={"Top " + selectedTagLabel + " recordings"}
               type="past"
               tags={tags}
            />
         </ConditionalWrapper>
      </Stack>
   )
}

const CategoryTagsContentSkeleton = () => {
   return <></>
}

export default CategoryTagsContent
