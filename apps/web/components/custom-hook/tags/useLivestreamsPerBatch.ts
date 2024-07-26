import { useMediaQuery, useTheme } from "@mui/material"

const useLivestreamsPerBatch = (): number => {
   const theme = useTheme()

   const extraSmall = useMediaQuery(theme.breakpoints.only("xs"))
   const small = useMediaQuery(theme.breakpoints.only("sm"))
   const medium = useMediaQuery(theme.breakpoints.only("md"))
   const large = useMediaQuery(theme.breakpoints.only("lg"))
   const wide = useMediaQuery(theme.breakpoints.only("xl"))

   const sizes = [
      { active: extraSmall, itemsPerBatch: 1 },
      { active: small, itemsPerBatch: 2 },
      { active: medium || large, itemsPerBatch: 3 },
      { active: wide, itemsPerBatch: 4 },
   ]
   return sizes.find((sizeData) => sizeData.active)?.itemsPerBatch || 2
}

export default useLivestreamsPerBatch
