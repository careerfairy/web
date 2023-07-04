import React from "react"
import { useRouter } from "next/router"
import { Theme, useTheme } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { SystemStyleObject } from "@mui/system"

import CareerInspiration from "./CareerInpiration"

type FooterProps = {
   background?: string
   sx?: SystemStyleObject<Theme>
   bottom?: boolean
}

const MAIL_TO_ADDRESS = "info@careerfairy.io"

const Footer = ({ background, sx, bottom }: FooterProps) => {
   const router = useRouter()
   const shouldDisplayCareerInspiration = !![
      "/",
      "/career-center",
      "/about-us",
   ].includes(router.pathname)

   return (
      <Box
         sx={[
            {
               background: (theme: Theme) =>
                  background || theme.palette.common.white,
            },
            sx,
            bottom && { mt: "auto" },
         ]}
         id="page-footer"
      >
         {shouldDisplayCareerInspiration && <CareerInspiration />}
         <Typography align="center">
            {new Date().getFullYear()} - CareerFairy AG - Made in Zurich,
            Switzerland - Contact:
            <Box
               component="a"
               sx={{
                  marginLeft: 5,
               }}
               href={`mailto:${MAIL_TO_ADDRESS}`}
            >
               {MAIL_TO_ADDRESS}
            </Box>
         </Typography>
      </Box>
   )
}

export default Footer
