import { IconButton } from "@mui/material"
import { MoreVertical } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   iconButton: {
      p: 0.75,
      color: "neutral.700",
      "&:hover": {
         backgroundColor: "neutral.100",
      },
   },
})

interface QuickActionIconProps {
   onClick?: () => void
}

export const QuickActionIcon = ({ onClick }: QuickActionIconProps) => {
   return (
      <IconButton sx={styles.iconButton} onClick={onClick}>
         <MoreVertical size={16} />
      </IconButton>
   )
}
