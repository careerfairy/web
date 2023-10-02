import { Box, Stack, Typography } from "@mui/material"
import { ReactElement } from "react"
import { sxStyles } from "types/commonTypes"
import { BrandedTextFieldField } from "../../../common/inputs/BrandedTextField"
import { InputAdornment } from "@mui/material"
import { IconButton } from "@mui/material"
import { Delete } from "@mui/icons-material"

const styles = sxStyles({
   root: {
      p: 2,
   },
   optionsLabel: {
      color: "rgba(95, 95, 95, 0.50)",
      fontSize: "1.14286rem",
   },
   optionValue: {
      color: "#5F5F5F",
      fontSize: "1.14286rem",
   },
})

type Props = {
   cardinal?: number
   editing?: boolean
   lastItem?: boolean
   value: string
   name: string
   onDelete: () => void
   canDelete?: boolean
}

const QuestionOption: React.FC<Props> = ({
   cardinal = 1,
   editing,
   lastItem,
   value,
   name,
   onDelete,
   canDelete,
}): ReactElement => {
   return editing ? (
      <Box px={2} py={0.75}>
         <BrandedTextFieldField
            label={`Question option ${cardinal ?? 1}`}
            placeholder="Insert your question here"
            name={name}
            fullWidth
            InputProps={{
               endAdornment: canDelete ? (
                  <InputAdornment position="end">
                     <IconButton
                        aria-label="delete option"
                        onClick={onDelete}
                        edge="end"
                        disabled={!canDelete}
                     >
                        <Delete />
                     </IconButton>
                  </InputAdornment>
               ) : null,
            }}
         />
      </Box>
   ) : (
      <Stack
         sx={[
            styles.root,
            {
               borderBottom: lastItem ? "none" : "1px solid #EEE",
            },
         ]}
         spacing={1}
      >
         <Typography sx={styles.optionsLabel}>Option {cardinal}</Typography>
         <Typography sx={styles.optionValue}>{value}</Typography>
      </Stack>
   )
}

export default QuestionOption
