import BrandedTextField from "../../../common/inputs/BrandedTextField"
import { ReactElement } from "react"
import { Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      color: "#212020",
      fontWeight: 600,
      fontSize: "18px",
   },
})

type Props = {
   editing?: boolean
   value: string
   setValue: (value: string) => void
}

const QuestionName: React.FC<Props> = ({
   value,
   setValue,
   editing,
}): ReactElement => {
   return editing ? (
      <BrandedTextField
         label="Question"
         placeholder="Insert your question here"
         value={value}
         onChange={(e) => setValue(e.target.value)}
         fullWidth
      />
   ) : (
      <Typography sx={styles.root}>{value}</Typography>
   )
}

export default QuestionName
