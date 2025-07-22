import { Chip } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useSearchContext } from "../../SearchContext"

const styles = sxStyles({
   chip: {
      borderRadius: "60px",
      border: (theme) => `1px solid ${theme.palette.secondary.light}`,
      backgroundColor: (theme) => theme.palette.neutral[50],
      color: (theme) => theme.palette.neutral[700],
      fontSize: "14px",
      fontWeight: "400",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.neutral[100],
      },
   },
   selectedChip: {
      borderRadius: "60px",
      border: (theme) => `1px solid ${theme.palette.secondary.light}`,
      backgroundColor: (theme) => theme.palette.primary.main,
      color: (theme) => theme.brand.white[50],
      fontSize: "14px",
      fontWeight: "400",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.primary[700],
      },
   },
})

const FilterSparks = () => {
   const { handleFilterSelect, getFilterValues } = useSearchContext()

   const hasPublicSparks = getFilterValues("publicSparks").includes("true")

   const handleToggle = () => {
      if (hasPublicSparks) {
         handleFilterSelect("publicSparks", [])
      } else {
         handleFilterSelect("publicSparks", ["true"])
      }
   }

   return (
      <Chip
         label="Companies with Sparks"
         clickable
         onClick={handleToggle}
         sx={[styles.chip, hasPublicSparks ? styles.selectedChip : null]}
      />
   )
}

export default FilterSparks
