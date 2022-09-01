import React from "react"
import { FormHelperText, Rating } from "@mui/material"
import Box from "@mui/material/Box"
import { RatingProps } from "@mui/material/Rating"

interface Props extends RatingProps {
   error?: string
}
const NormalRating = ({
   error,
   readOnly,
   onChange,
   value,
   name,
   ...rest
}: Props) => {
   return (
      <Box>
         <Rating
            name={name}
            value={Number(value)}
            size="large"
            readOnly={readOnly}
            max={5}
            onChange={onChange}
            {...rest}
         />
         {error && <FormHelperText>{error}</FormHelperText>}
      </Box>
   )
}

export default NormalRating
