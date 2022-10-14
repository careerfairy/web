import { CategoryContainerTopAligned } from "materialUI/GlobalContainers"
import { memo, useMemo } from "react"
import Box from "@mui/material/Box"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../types/commonTypes"

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
      const baseUrl = new URL(
         "https://go.crisp.chat/chat/embed/?website_id=b8c454ce-84e4-4039-b6b4-203b2c86ea66"
      )

      if (authenticatedUser.email) {
         baseUrl.searchParams.append("user_email", authenticatedUser.email)
      }

      return baseUrl.toString()
   }, [authenticatedUser.email])

   if (selectedState !== "support" || !showMenu) {
      return null
   }

   return (
      <CategoryContainerTopAligned className={undefined}>
         <Box sx={styles.root}>
            <iframe src={url}></iframe>
         </Box>
      </CategoryContainerTopAligned>
   )
}

export default memo(SupportCategory)
