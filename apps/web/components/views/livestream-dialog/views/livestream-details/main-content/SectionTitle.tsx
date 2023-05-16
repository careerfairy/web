import { FC } from "react"
import { Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"

const styles = sxStyles({
   root: {
      fontSize: "1.428rem",
      fontWeight: 500,
      color: "#838383",
   },
})

type Props = {}

const SectionTitle: FC<Props> = (props) => {
   return <Typography sx={styles.root}>{props.children}</Typography>
}

export default SectionTitle
