import { useMediaQuery, useTheme } from "@mui/material"

const useLivestreamsPerBatch = (type: "future" | "past"): number => {
   const theme = useTheme()

   const extraSmall = useMediaQuery(theme.breakpoints.only("xs"))
   const small = useMediaQuery(theme.breakpoints.only("sm"))

   // Taking into consideration side drawer
   const smallUpperLimit = useMediaQuery(theme.breakpoints.down(1280))
   const smallLowerLimit = useMediaQuery(theme.breakpoints.up(600))

   const isWithinSmallLimits = smallLowerLimit && smallUpperLimit

   const large = useMediaQuery(theme.breakpoints.up("lg"))

   // One of them must be true
   const sizes = [
      { active: extraSmall, itemsPerBatch: type === "future" ? 6 : 3 },
      {
         active: small || isWithinSmallLimits,
         itemsPerBatch: type === "future" ? 6 : 4,
      },
      { active: large, itemsPerBatch: 3 },
   ]

   // Setting default in case of no match
   return sizes.find((sizeData) => sizeData.active)?.itemsPerBatch || 2
}

export default useLivestreamsPerBatch
