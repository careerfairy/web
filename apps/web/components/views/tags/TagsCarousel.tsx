import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { Chip, Stack } from "@mui/material"
import Box from "@mui/material/Box"
import { forwardRef, useImperativeHandle } from "react"
import { sxStyles } from "types/commonTypes"

const slideSpacing = 21
const desktopSlideWidth = 306 + slideSpacing
const mobileSlideWidth = 280 + slideSpacing

const styles = sxStyles({
   viewport: {
      overflow: "hidden",
   },
   slide: {
      flex: {
         xs: `0 0 ${mobileSlideWidth}px`,
         md: `0 0 ${desktopSlideWidth}px`,
      },
      minWidth: 0,
      paddingLeft: `${slideSpacing}px`,
      position: "relative",
      height: {
         xs: 405,
         md: 443,
      },
   },
   paddingSlide: {
      flex: `0 0 ${slideSpacing}px`,
   },
   chip: {
      backgroundColor: (t) => t.palette.neutral[50],
      color: (t) => t.palette.neutral[700],
      py: "8px",
      px: "4px",
   },
   selectedChip: {
      backgroundColor: (t) => t.palette.primary.main,
      color: "white",
      "&:hover": {
         backgroundColor: (t) => t.palette.primary.main,
         color: "white",
      },
   },
})

export type ChildRefType = {
   goNext: () => void
   goPrev: () => void
}

type PropType = {
   selectedCategories: string[]
   emblaRef
   tags?: OptionGroup[]
   onTagClick?: (tagId: string) => void
   onAllClick?: () => void
}

const TagsCarousel = forwardRef<ChildRefType, PropType>((props, ref) => {
   const { selectedCategories, emblaRef, tags, onTagClick } = props

   useImperativeHandle(ref, () => ({
      goNext: () => {},
      goPrev: () => {},
   }))

   return (
      <Box sx={styles.viewport} ref={emblaRef}>
         <Stack direction={"row"} spacing={"12px"} pl={2}>
            {/* Chip for All  */}
            <Chip
               sx={[
                  styles.chip,
                  !selectedCategories.length ? styles.selectedChip : null,
               ]}
               clickable
               onClick={props.onAllClick}
               label="All"
            />
            {tags?.length
               ? tags.map((category) => {
                    const isSelected = selectedCategories.includes(category.id)
                    return (
                       <Chip
                          sx={[
                             styles.chip,
                             isSelected ? styles.selectedChip : null,
                          ]}
                          key={category.id}
                          label={category.name}
                          onClick={() => onTagClick(category.id)}
                       />
                    )
                 })
               : null}

            {/**
             * This prevents the last slide from touching the right edge of the viewport.
             */}
            <Box sx={styles.paddingSlide}></Box>
         </Stack>
      </Box>
   )
})

TagsCarousel.displayName = "TagsCarousel"

export default TagsCarousel
