import { CardContent, Typography } from "@mui/material"
import CardMedia from "@mui/material/CardMedia"
import { searchImage, signInImage } from "../../../constants/images"
import React from "react"
import Box from "@mui/material/Box"
import Link from "./Link"
import { useRouter } from "next/router"

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
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
   },
}

interface NavPromptProps {
   imageSrc?: string
}

const NavPrompt = ({ imageSrc = signInImage }: NavPromptProps) => {
   const { asPath } = useRouter()

   return (
      <Box
         noLinkStyle
         component={Link}
         href={{
            pathname: `/signup`,
            query: {
               absolutePath: asPath,
            },
         }}
         sx={styles.root}
      >
         <Typography align={"center"} variant={"h6"} gutterBottom>
            Don't have an account?
         </Typography>
         <Typography
            sx={styles.subheader}
            variant={"body1"}
            align={"center"}
            color="text.secondary"
            gutterBottom
         >
            click here to register
         </Typography>
         <CardContent>
            <CardMedia sx={styles.media}>
               <img alt="Find Groups" src={imageSrc} />
            </CardMedia>
         </CardContent>
      </Box>
   )
}

export default NavPrompt
