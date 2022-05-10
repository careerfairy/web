import React, { FC } from "react"
import { Typography, TypographyProps } from "@mui/material"

const ContentCardTitle: FC<TypographyProps> = ({ children, ...props }) => {
   return (
      <Typography variant={"h5"} color={"text.secondary"} {...props}>
         {children}
      </Typography>
   )
}

export default ContentCardTitle
