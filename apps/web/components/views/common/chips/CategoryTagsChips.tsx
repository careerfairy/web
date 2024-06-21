import { Chip, Stack } from "@mui/material"
import { ChipProps } from "@mui/material/Chip/Chip"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useAvailableTagsByHits } from "components/custom-hook/tags/useAvailableTagsByHits"

// const styles = sxStyles({
//    chipNormal: {
//       color: (theme) => theme.palette.common.black,
//       borderColor: (theme) => theme.palette.common.white,
//       backgroundColor: (theme) => theme.palette.common.white,
//    },
//    chipOutlined: {
//       color: (theme) => theme.palette.common.white,
//       borderColor: (theme) => theme.palette.common.white,
//       backgroundColor: "transparent",
//    },
// })

interface CategoryTagsChipsProps extends ChipProps {
   selectedCategories: string[]
   handleCategoryClick: (categoryId: string) => void
   handleAllClick: () => void
}

const CategoryTagsChips = (props: CategoryTagsChipsProps) => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content {...props} />
      </SuspenseWithBoundary>
   )
}

const Content = ({
   selectedCategories,
   handleCategoryClick,
   handleAllClick,
}: CategoryTagsChipsProps) => {
   // Hook to set selected chips
   // const tagsContentHits: TagsContentHits = useTagsContentHits()
   // console.log("🚀 ~ CategoryTagsChips ~ tagsContentHits:", tagsContentHits)
   // Hook to get used tags by content
   const availableCategories = useAvailableTagsByHits()
   console.log(
      "🚀 ~ CategoryTagsChips ~ availableCategories:",
      availableCategories
   )

   // Could be more precise when checking but since no duplicates should be ok
   const isAllSelected =
      selectedCategories.length === availableCategories.length

   // Tags sorted by user tags in profile usage
   return (
      <Stack direction={"row"}>
         {/* Chip for All  */}
         <Chip
            label="All"
            color={isAllSelected ? "primary" : "secondary"}
            onClick={() => handleAllClick()}
         />
         {availableCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.id)
            return (
               <Chip
                  key={category.id}
                  label={category.name}
                  color={isSelected ? "primary" : "secondary"}
                  onClick={() => handleCategoryClick(category.id)}
               />
            )
         })}
      </Stack>
   )
}

const Loader = () => {
   return (
      <>
         <h1>TODO SKELETON</h1>
      </>
   )
}
export default CategoryTagsChips
