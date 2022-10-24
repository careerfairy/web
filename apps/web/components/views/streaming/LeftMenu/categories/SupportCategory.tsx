import { CategoryContainerTopAligned } from "materialUI/GlobalContainers"
import { memo, useMemo } from "react"
import Box from "@mui/material/Box"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../types/commonTypes"
import { buildCrispEmbedURL } from "../../../../../scripts/crisp"

type Props = {
   selectedState: string // current tab open, this one is "jobs"
   showMenu: boolean
}
const styles = sxStyles({
   root: {
      width: "100%",
      height: "100%",
      overflow: "hidden",
      "& iframe": {
         width: "inherit",
         height: "inherit",
         border: "none",
      },
   },
})

const SupportCategory = ({ selectedState, showMenu }: Props) => {
   const { authenticatedUser } = useAuth()

   const url = useMemo(() => {
      return buildCrispEmbedURL(authenticatedUser.email, authenticatedUser.uid)
   }, [authenticatedUser.email, authenticatedUser.uid])

   if (selectedState !== "support" || !showMenu) {
      return null
   }

   return (
      <CategoryContainerTopAligned>
         <Box sx={styles.root}>
            <iframe src={url}></iframe>
         </Box>
      </CategoryContainerTopAligned>
   )
}

export default memo(SupportCategory)
