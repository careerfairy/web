import { FormikErrors } from "formik"
import BrandedTextField from "../inputs/BrandedTextField"
import { ReactElement } from "react"
import { Typography } from "@mui/material"

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
      ></BrandedTextField>
   ) : (
      <Typography
         sx={{ color: "#212020", fontWeight: 600, fontSize: "18px", m: 1 }}
      >
         {value}
      </Typography>
   )
}

export default QuestionName
