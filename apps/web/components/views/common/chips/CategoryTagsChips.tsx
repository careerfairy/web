import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { Chip, Stack } from "@mui/material"

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

type CategoryTagsChipsProps = {
   selectedCategories: string[]
   availableCategories: OptionGroup[]
   handleCategoryClick: (categoryId: string) => void
   handleAllClick: () => void
}

const CategoryTagsChips = ({
   selectedCategories,
   availableCategories,
   handleCategoryClick,
   handleAllClick,
}: CategoryTagsChipsProps) => {
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

export default CategoryTagsChips
