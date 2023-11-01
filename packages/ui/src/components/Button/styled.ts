import { Button, styled } from "@mui/material"
import { shouldForwardProp } from "../../utils"

import { ButtonProps } from "."

export const ButtonStyled = styled(Button, {
   shouldForwardProp: shouldForwardProp<ButtonProps>(["isDisabled", "bgColor"]),
})<ButtonProps>(({ isDisabled, bgColor }) => ({
   width: isDisabled ? "100%" : undefined,
   backgroundColor: bgColor,
   "&.Mui-disabled": {
      // add styles for disabled state
   },
}))
