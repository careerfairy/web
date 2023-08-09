import { Typography } from "@mui/material"
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
      <div className="section-left_column">
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
      </div>
   )
}
export default LeftColumn
