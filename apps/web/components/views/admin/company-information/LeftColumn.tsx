import { Box, Stack, Typography } from "@mui/material"
import React from "react"

type ConditionalWrapperProps = {
   title: string
   description: string
}
const LeftColumn: React.FC<ConditionalWrapperProps> = ({
   title,
   description,
}) => {
   return (
      <Stack>
         <Typography
            sx={{
               color: "#2C2C2C",
               fontSize: "24px",
               fontWeight: 600,
               mb: "12px",
            }}
         >
            {title}
         </Typography>
         <Typography
            sx={{ fontSize: "16px", fontWeight: 400, color: "#5F5F5F" }}
         >
            {description}
         </Typography>
      </Stack>
   )
}
export default LeftColumn
