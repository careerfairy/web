import { ReactElement } from "react"
import { Box, Stack, Typography } from "@mui/material"
import BrandedTextField from "../inputs/BrandedTextField"

type Props = {
   cardinal?: number
   editing?: boolean
   value: string
   setValue: (value: string) => void
}

const QuestionOption: React.FC<Props> = ({
   cardinal = 1,
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
         sx={{ m: 1 }}
      ></BrandedTextField>
   ) : (
      <Stack
         sx={{
            borderBottom: "1px solid #EEE",
            width: "-webkit-fill-available",
            margin: "0px",
         }}
      >
         <Typography
            sx={{
               color: "rgba(95, 95, 95, 0.50)",
               fontSize: "16px",
               fontWeight: 400,
               mt: "16px",
               ml: "16px",
               mr: "16px",
               mb: "8px",
            }}
         >
            Option {cardinal}
         </Typography>
         <Typography
            sx={{
               color: "#5F5F5F",
               fontSize: "16px",
               fontWeight: 400,
               ml: "16px",
               mr: "16px",
               mb: "16px",
            }}
         >
            {value}
         </Typography>
      </Stack>
   )
}

export default QuestionOption
