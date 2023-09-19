import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import { IconButton } from "@mui/material"
import { useRouter } from "next/router"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      color: "white",
      "& svg": {
         width: 27.83,
         height: 27.83,
      },
   },
   dark: {
      color: "#3D3D47 !important",
   },
})

type Props = {
   dark?: boolean
}

const CloseSparksFeedButton: FC<Props> = ({ dark }) => {
   const { back } = useRouter()

   return (
      <IconButton
         sx={[styles.root, dark && styles.dark]}
         aria-label="close-sparks-feed"
         onClick={back}
      >
         <CloseRoundedIcon color="inherit" />
      </IconButton>
   )
}

export default CloseSparksFeedButton
