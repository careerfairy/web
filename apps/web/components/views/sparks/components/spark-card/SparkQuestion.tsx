import { Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      fontWeight: 400,
      pb: 0.1,
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
      <Typography
         sx={[styles.root, limitLines && styles.limitLines]}
         variant="brandedBody"
      >
         {question}
      </Typography>
   )
}

export default SparkQuestion
