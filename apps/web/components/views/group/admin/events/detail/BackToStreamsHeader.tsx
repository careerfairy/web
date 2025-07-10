import { Box } from "@mui/material"
import Link from "next/link"
import { ChevronLeft } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
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
   return (
      <Box
         sx={styles.root}
         component={Link}
         href={`/group/${groupId}/admin/content/live-streams`}
         shallow
      >
         <Box component={ChevronLeft} />
         {"Live stream details"}
      </Box>
   )
}
