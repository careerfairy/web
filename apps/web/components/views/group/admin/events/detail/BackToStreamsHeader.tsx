import { Box } from "@mui/material"
import { useRouter } from "next/router"
import { ChevronLeft } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 1,
      textDecoration: "none !important",
      color: "neutral.900",
      "& svg": {
         width: 24,
         height: 24,
         strokeWidth: 3,
      },
   },
})

type Props = {
   groupId: string
}

export const BackToStreamsHeader = ({ groupId }: Props) => {
   const router = useRouter()

   const handleClick = () => {
      if (window.history.length > 2) {
         router.back()
      } else {
         router.push(`/group/${groupId}/admin/content/live-streams`)
      }
   }

   return (
      <Box sx={styles.root} onClick={handleClick}>
         <Box component={ChevronLeft} />
         {"Live stream details"}
      </Box>
   )
}
