import React from "react"
import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import { MainLogo } from "components/logos"
// @ts-ignore
import { chromeLogo, edgeLogo, safariLogo } from "constants/images"

import { Stack, Typography } from "@mui/material"
import ReportIcon from "@mui/icons-material/Report"
import { useRouter } from "next/router"
import { getBaseUrl } from "../../helperFunctions/HelperFunctions"

const BrowserIncompatibleOverlay = () => {
   const { asPath } = useRouter()

   return (
      <Container
         sx={{
            backgroundColor: "background.default",
            display: "grid",
            placeItems: "center",
            height: "100vh",
         }}
         maxWidth={false}
      >
         <Stack spacing={2} alignItems="center">
            <MainLogo sx={{ width: 250 }} />
            <ReportIcon sx={{ fontSize: "5rem" }} />
            <Typography
               align="center"
               gutterBottom
               fontWeight="600"
               variant="h4"
            >
               Whoops... CareerFairy doesn&apos;t support your browser
            </Typography>
            <Typography
               align="center"
               color="text.secondary"
               fontWeight="600"
               variant="h6"
            >
               Compatible browsers include up-to-date versions of Google Chrome,
               Microsoft Edge and Safari:
            </Typography>
            <Stack
               flexWrap="wrap"
               justifyContent="center"
               direction="row"
               alignItems="center"
               spacing={4}
            >
               <a href={`microsoft-edge:${getBaseUrl()}${asPath}`}>
                  <Box
                     sx={{ cursor: "pointer" }}
                     component="img"
                     width={100}
                     alt="edge"
                     src={edgeLogo}
                  />
               </a>
               <a href={`https://www.google.com/chrome/`}>
                  <Box
                     sx={{ cursor: "pointer" }}
                     component="img"
                     width={100}
                     alt="chrome"
                     src={chromeLogo}
                  />
               </a>
            </Stack>
            <a href={`https://support.apple.com/en-hk/HT201541`}>
               <Box
                  sx={{ cursor: "pointer" }}
                  component="img"
                  width={100}
                  alt="safari"
                  src={safariLogo}
               />
            </a>
         </Stack>
      </Container>
   )
}

//
export default BrowserIncompatibleOverlay
