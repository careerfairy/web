import { Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      fontSize: "1.28571rem",
      fontWeight: 500,
      lineHeight: "117.5%",
      letterSpacing: "-0.03121rem",
      pb: 0.1,
   },
   fullScreenRoot: {
      fontSize: "16px",
      fontWeight: 500,
      lineHeight: "24px",
      letterSpacing: "-0.03121rem",
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
   const isFullScreen = useSparksFeedIsFullScreen()
   return (
      <Typography
         sx={[
            isFullScreen ? styles.fullScreenRoot : styles.root,
            limitLines && styles.limitLines,
         ]}
      >
         {question}
      </Typography>
   )
}

export default SparkQuestion
