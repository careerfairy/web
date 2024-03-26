import { Box, CircularProgress, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { sxStyles } from "types/commonTypes"
import GroupSparksPlanMobileSelector from "./components/GroupSparksPlanMobileSelector"

const mobileBreakpoint = "md"

const styles = sxStyles({
   title: {
      color: (theme) => theme.palette.neutral[800],
      mr: 15,
      textAlign: "start",
      fontFamily: "Poppins",
      fontSize: "32px",
      fontStyle: "normal",
      fontWeight: "700",
      lineHeight: "48px",
      letterSpacing: {
         xs: "-0.04343rem",
         [mobileBreakpoint]: "-0.04886rem",
      },
   },
   content: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
   },
   contentMobile: {
      display: "flex",
      flexDirection: "column",
   },
   contentMobileWrapper: {
      display: "flex",
      flexDirection: "column",
   },
   checkoutButton: {
      mt: 2,
      backgroundColor: (theme) => theme.palette.secondary.main,
      "&:hover": {
         backgroundColor: (theme) => theme.palette.secondary.dark,
      },
      width: "276px",
      color: (theme) => theme.brand.white[100],
      textAlign: "center",
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "24px",
   },
   checkoutWrapper: {
      mt: 2,
      alignItems: "center",
   },
   cancelButton: {
      color: (theme) => theme.palette.black[700],
   },
   checkoutDescription: {
      color: (theme) => theme.palette.neutral[600],
      textAlign: "center",
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "20px",
   },
})

const SelectSparksPlanView = () => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <View />
      </SuspenseWithBoundary>
   )
}

const View = () => {
   return (
      <Box>
         <Typography component="h1" sx={styles.title}>
            <Box>
               Select your{" "}
               <Box component="span" color="secondary.main">
                  Sparks
               </Box>{" "}
               plan
            </Box>
         </Typography>

         <Box mt={5} />
         <Box
            mt={{
               md: 0,
            }}
         />

         <Box sx={styles.contentMobileWrapper}>
            <GroupSparksPlanMobileSelector />

            <Box
               mb={{
                  xs: "auto",
                  md: 0,
               }}
            />
            <Stack direction={"column"} spacing={2} sx={styles.checkoutWrapper}>
               <Box
                  sx={styles.checkoutDescription}
                  display={"flex"}
                  width={"100%"}
                  alignContent={"start"}
               >
                  Content available for 1 year
               </Box>
            </Stack>
         </Box>
         <Box mt={5} />
      </Box>
   )
}

export default SelectSparksPlanView
