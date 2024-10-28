import { Typography } from "@mui/material"
import { FC } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"

const styles = sxStyles({
   root: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[500],
      mb: 2,
      display: "inline-block",
   },
})

type Props = {
   children: React.ReactNode
}

const SectionTitle: FC<Props> = (props) => {
   return (
      <Typography sx={styles.root} variant="brandedH5">
         {props.children}
      </Typography>
   )
}

export default SectionTitle
