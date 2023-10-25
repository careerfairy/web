import React from "react"
import Link from "next/link"
import { alpha } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"

import footerLinks from "./footerLinks"
import icons from "./icons"
import { getWindow } from "../../../util/PathUtils"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      color: (theme) => alpha(theme.palette.text.secondary, 0.5),
      "& > *": {},
      marginBottom: 3,
   },
   inspiration: {
      marginTop: 2,
      marginBottom: 3,
      color: "inherit",
   },
   link: {
      display: "flex",
      justifyContent: "center",
      padding: 1,
      "& a": {
         color: "inherit",
         borderColor: "inherit",
         borderBottom: "2px solid",
         "&:hover": {
            color: "primary.main",
         },
      },
   },
   iconsContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   icon: {
      padding: (theme) => theme.spacing(0, 3),
      "& .MuiSvgIcon-root": (theme) => ({
         fontSize: theme.spacing(4),
         color: (theme) => alpha(theme.palette.text.secondary, 0.5),
         "&:hover": {
            color: "primary.main",
         },
      }),
   },
})

const CareerInspiration = () => {
   return (
      <Container sx={styles.container}>
         <Typography align="center" variant="h6" sx={styles.inspiration}>
            LIVE STREAMING CAREER INSPIRATION
         </Typography>
         <Grid justifyContent="center" mb={3} container>
            {footerLinks.map(({ links, category }) => (
               <Grid key={category} item xs={12} sm={4} md={3} lg={2}>
                  {links.map(({ label, href }) => (
                     <Box key={href} sx={styles.link}>
                        {href === "uc_settings" ? (
                           <a
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                 getWindow()?.UC_UI?.showSecondLayer()
                              }}
                           >
                              {label}
                           </a>
                        ) : (
                           <Link href={href}>{label}</Link>
                        )}
                     </Box>
                  ))}
               </Grid>
            ))}
         </Grid>
         <Box sx={styles.iconsContainer}>
            {icons.map(({ icon, href }) => (
               <Box
                  component="a"
                  sx={styles.icon}
                  href={href}
                  key={href}
                  target="_blank"
                  rel="noopener noreferrer"
               >
                  {icon}
               </Box>
            ))}
         </Box>
      </Container>
   )
}

export default CareerInspiration
