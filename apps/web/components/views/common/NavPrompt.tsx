import { CardContent, Typography } from "@mui/material"
import CardMedia from "@mui/material/CardMedia"
import { signInImage } from "../../../constants/images"
import React from "react"
import Box from "@mui/material/Box"
import Link from "./Link"
import { useRouter } from "next/router"
import { LinkProps } from "next/link"

const styles = {
   media: {
      display: "grid",
      placeItems: "center",
      "& img": {
         maxWidth: "60%",
      },
   },
   subheader: {
      whiteSpace: "pre-wrap",
   },
   root: {
      display: "flex",
      flexDirection: "column",
   },
   title: {
      color: "text.primary",
      whiteSpace: "normal",
   },
}

interface NavPromptProps {
   imageSrc?: string
   noLink?: boolean
   title?: string
   subtitle?: string
   href?: LinkProps["href"]
}

const NavPrompt = ({
   imageSrc = signInImage,
   subtitle = "click here to register",
   title = "Don't have an account?",
   noLink,
   href,
}: NavPromptProps) => {
   const { asPath } = useRouter()

   return (
      <Box
         noLinkStyle
         component={!noLink && Link}
         href={
            noLink
               ? undefined
               : href || {
                    pathname: `/signup`,
                    query: {
                       absolutePath: asPath,
                    },
                 }
         }
         sx={styles.root}
      >
         <Box>
            <Typography
               sx={styles.title}
               align={"center"}
               variant={"h5"}
               gutterBottom
            >
               {title}
            </Typography>
            <Typography
               sx={styles.subheader}
               variant={"body1"}
               align={"center"}
               color="text.secondary"
               gutterBottom
            >
               {subtitle}
            </Typography>
         </Box>
         <CardContent>
            <CardMedia sx={styles.media}>
               <img alt="Find Groups" src={imageSrc} />
            </CardMedia>
         </CardContent>
      </Box>
   )
}

export default NavPrompt
