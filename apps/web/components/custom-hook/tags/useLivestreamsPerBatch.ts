import { useMediaQuery, useTheme } from "@mui/material"

const useLivestreamsPerBatch = (): number => {
   const theme = useTheme()

   const extraSmall = useMediaQuery(theme.breakpoints.only("xs"))
   const small = useMediaQuery(theme.breakpoints.only("sm"))
   const smallUpperLimit = useMediaQuery(theme.breakpoints.down(989))
   const smallLowerLimit = useMediaQuery(theme.breakpoints.up(900))

   const smallIsh = smallLowerLimit && smallUpperLimit

   const medium = useMediaQuery(theme.breakpoints.only("md"))
   const large = useMediaQuery(theme.breakpoints.only("lg"))
   const wide = useMediaQuery(theme.breakpoints.up("lg"))

   const sizes = [
      { active: extraSmall, itemsPerBatch: 1 },
      { active: small, itemsPerBatch: 2 },
      { active: smallIsh, itemsPerBatch: 2 },
      { active: medium || large, itemsPerBatch: 3 },
      { active: wide, itemsPerBatch: 4 },
   ]
   return sizes.find((sizeData) => sizeData.active)?.itemsPerBatch || 4
}

export default useLivestreamsPerBatch
