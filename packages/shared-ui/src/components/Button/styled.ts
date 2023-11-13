import { Button, styled } from "@mui/material"

import { ButtonProps } from "."
import { shouldForwardProp } from "../../utils"

export const ButtonStyled = styled(Button, {
   shouldForwardProp: shouldForwardProp<ButtonProps>(["isDisabled", "bgColor"]),
})<ButtonProps>(({ theme, isDisabled, size, bgColor }) => ({
   width: isDisabled ? "100%" : undefined,
   color: size === "small" ? theme.palette.secondary.main : undefined,
   backgroundColor: bgColor,
   "&.Mui-disabled": {},
}))
