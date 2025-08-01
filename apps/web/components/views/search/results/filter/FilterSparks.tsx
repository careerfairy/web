import { Chip } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useSearchContext } from "../../SearchContext"

const styles = sxStyles({
   chip: {
      p: "8px 12px 8px 16px",
      backgroundColor: "neutral.50",
      "& .MuiChip-label": {
         pl: 0,
         pr: "8px",
         fontWeight: "400",
         color: "neutral.700",
      },
   },
   selectedChip: {
      p: "8px 12px 8px 16px",
      background: (theme) => theme.palette.primary[500],
      "&:hover": {
         background: (theme) => theme.palette.primary[600],
      },
      "& .MuiChip-label": {
         color: (theme) => theme.brand.white[50],
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
