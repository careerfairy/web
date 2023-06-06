import { FC } from "react"
import { Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"

const styles = sxStyles({
   root: {
      fontSize: "1.428rem !important",
      fontWeight: 500,
      color: "#838383",
      mb: 2.25,
   },
})

type Props = {}

const SectionTitle: FC<Props> = (props) => {
   return (
      <Typography sx={styles.root} component="h2">
         {props.children}
      </Typography>
   )
}

export default SectionTitle
