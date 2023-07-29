import { ReactElement } from "react"
import { Typography } from "@mui/material"
import BrandedTextField from "../inputs/BrandedTextField"

type Props = {
   cardinal?: number
   editing?: boolean
   value: string
   setValue: (value: string) => void
}

const QuestionOption: React.FC<Props> = ({
   cardinal = 0,
   editing = false,
   value,
   setValue,
}): ReactElement => {
   return editing ? (
      <BrandedTextField
         label={`Question option ${cardinal ?? 1}`}
         placeholder="Insert your question here"
         value={value}
         onChange={(event) => setValue(event.target.value)}
      ></BrandedTextField>
   ) : (
      <Typography>{value}</Typography>
   )
}

export default QuestionOption
