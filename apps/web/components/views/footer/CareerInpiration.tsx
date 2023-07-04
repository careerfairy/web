import React from "react"
import Link from "next/link"
import { alpha, useTheme } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"

import footerLinks from "./footerLinks"
import icons from "./icons"
import { getWindow } from "../../../util/PathUtils"

const CareerInspiration = () => {
   const theme = useTheme()
   const greyColor = alpha(theme.palette.text.secondary, 0.5)

   return (
      <Container
         sx={(theme) => ({
            color: greyColor,
            "& > *": {
               marginBottom: theme.spacing(3),
            },
         })}
      >
         <div>
            <Typography
               align="center"
               sx={{
                  marginTop: (theme) => theme.spacing(2),
                  color: "inherit",
               }}
               variant="h6"
            >
               LIVE STREAMING CAREER INSPIRATION
            </Typography>
         </div>
         <div>
            <Grid justifyContent="center" container>
               {footerLinks.map(({ links, category }) => (
                  <Grid key={category} item xs={12} sm={4} md={3} lg={2}>
                     {links.map(({ label, href }) => (
                        <Box
                           key={href}
                           sx={(theme) => ({
                              display: "flex",
                              justifyContent: "center",
                              padding: theme.spacing(1),
                              "& a": {
                                 color: "inherit",
                                 borderColor: "inherit",
                                 borderBottom: "2px solid",
                                 "&:hover": {
                                    color: theme.palette.primary.main,
                                 },
                              },
                           })}
                        >
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
                              <Link href={href}>
                                 <a>{label}</a>
                              </Link>
                           )}
                        </Box>
                     ))}
                  </Grid>
               ))}
            </Grid>
         </div>
         <Box
            sx={{
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
            }}
         >
            {icons.map(({ icon, href }) => (
               <Box
                  component="a"
                  sx={(theme) => ({
                     padding: theme.spacing(0, 3),
                     "& .MuiSvgIcon-root": {
                        fontSize: theme.spacing(4),
                        color: greyColor,
                        "&:hover": {
                           color: theme.palette.primary.main,
                        },
                     },
                  })}
                  href={href}
                  key={href}
                  target="_blank"
                  rel="noopener
                            noreferrer"
               >
                  {icon}
               </Box>
            ))}
         </Box>
      </Container>
   )
}

export default CareerInspiration
