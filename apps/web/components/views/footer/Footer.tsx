import React from "react"
import { useRouter } from "next/router"
import { alpha, Theme } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { sxStyles } from "types/commonTypes"
import { MAIL_TO_ADDRESS } from "../../../constants/links"
import CareerInspiration from "./CareerInpiration"

const styles = sxStyles({
   container: {
      color: (theme) => alpha(theme.palette.text.secondary, 0.5),
      "& > *": {},
      marginBottom: 3,
   },
})

type FooterProps = {
   background?: string
   bottom?: boolean
}

const Footer = ({ background, bottom }: FooterProps) => {
   const router = useRouter()
   const shouldDisplayCareerInspiration = [
      "/",
      "/career-center",
      "/about-us",
   ].includes(router.pathname)

   return (
      <Box
         bgcolor={(theme: Theme) => background ?? theme.palette.common.white}
         mt={bottom && "auto"}
         id="page-footer"
      >
         {shouldDisplayCareerInspiration ? <CareerInspiration /> : null}
         <Typography align="center" sx={styles.container}>
            {new Date().getFullYear()} - CareerFairy AG - Made in Zurich,
            Switzerland - Contact:
            <Box component="a" ml={5} href={`mailto:${MAIL_TO_ADDRESS}`}>
               {MAIL_TO_ADDRESS}
            </Box>
         </Typography>
      </Box>
   )
}

export default Footer
