import { Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      fontSize: "1.28571rem",
      fontWeight: 500,
      lineHeight: "117.5%",
      letterSpacing: "-0.03121rem",
   },
   limitLines: {
      ...getMaxLineStyles(2),
   },
})

type Props = {
   question: string
   limitLines?: boolean
}

const SparkQuestion: FC<Props> = ({ question, limitLines }) => {
   return (
      <Typography sx={[styles.root, limitLines && styles.limitLines]}>
         {question}
      </Typography>
   )
}

export default SparkQuestion
