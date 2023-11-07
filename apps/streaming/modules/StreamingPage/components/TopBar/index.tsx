import { ResponsiveButton, sxStyles } from "@careerfairy/shared-ui"
import {
   AppBar,
   Box,
   Container,
   Stack,
   Toolbar,
   Typography,
   Button,
   IconButton,
} from "@mui/material"
import Image from "next/image"
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosRounded"
import EyeIcon from "@mui/icons-material/RemoveRedEyeOutlined"
import React from "react"
import { Link } from "components"
import { CompanyIcon } from "components/icons"
import { theme } from "utils"

const styles = sxStyles({
   root: {
      borderBottomColor: {
         xs: "transparent",
         tablet: "black.400",
      },
      borderBottomWidth: 1,
      borderBottomStyle: "solid",
      pt: 2.75,
      pb: 1.75,
   },
   toolbar: {
      minHeight: "auto !important",
   },
   backicon: {
      fontSize: 18,
   },
   timer: {
      bgcolor: "error.500",
      color: "white",
      p: 1,
      borderRadius: "3px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   whiteCircle: {
      bgcolor: "white",
      borderRadius: "50%",
      width: 9,
      height: 9,
      mr: "3px",
   },
   circularBtn: {
      borderRadius: "50%",
      height: {
         xs: 32,
         sm: 40,
      },
      width: {
         xs: 32,
         sm: 40,
      },
      "& svg": {
         fontSize: 20,
      },
   },
   withBorder: {
      border: (theme) => `1px solid ${theme.brand.black[400]}`,
   },
})

export const TopBar = () => {
   return (
      <AppBar
         color="transparent"
         elevation={0}
         position="static"
         sx={styles.root}
      >
         <Container maxWidth={false}>
            <Toolbar sx={styles.toolbar} disableGutters>
               <Stack direction="row" spacing={1} alignItems="center">
                  <Stack
                     component={Link}
                     noLinkStyle
                     href={"https://careerfairy.io"}
                     direction="row"
                     alignItems="center"
                  >
                     <ArrowBackIcon sx={styles.backicon} />
                     <Image
                        style={{
                           objectFit: "contain",
                        }}
                        src="/logo_teal.png"
                        width={150}
                        height={32}
                        alt={"logo"}
                     />
                  </Stack>
                  <Box sx={styles.timer}>
                     <Box sx={styles.whiteCircle} />
                     <Typography variant="xsmall">16:03</Typography>
                  </Box>
               </Stack>
               <Stack direction="row" spacing={1} alignItems="center">
                  <ResponsiveButton
                     sx={styles.withBorder}
                     variant="outlined"
                     startIcon={<EyeIcon />}
                  >
                     128
                  </ResponsiveButton>
                  <IconButton sx={[styles.circularBtn, styles.withBorder]}>
                     <CompanyIcon />
                  </IconButton>
               </Stack>
            </Toolbar>
         </Container>
      </AppBar>
   )
}
