import { FC } from "react"
import BaseDialogView, { MainContent } from "../../BaseDialogView"
import { Box, Skeleton, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../../../types/commonTypes"
import useIsMobile from "components/custom-hook/useIsMobile"

const styles = sxStyles({
   fullHeight: {
      height: "100%",
   },
   mainContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      py: {
         xs: 0,
         md: 5,
      },
      lineHeight: "150%",
      justifyContent: {
         xs: "space-between",
         md: "center",
      },
      minHeight: {
         xs: 650,
      },
   },
   confettiGraphic: {
      mx: "auto",
      borderRadius: 8,
   },
   title: {
      my: "auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
   },
   description: {
      textAlign: "center",
      fontSize: "1.142rem",
      my: "auto",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      maxWidth: 680,
   },
   btn: {
      borderRadius: 8,
   },
   buttons: {
      maxWidth: 400,
      width: "100%",
   },
})

const RegisterSuccessViewSkeleton: FC = () => {
   const isMobile = useIsMobile()

   return (
      <BaseDialogView
         sx={styles.fullHeight}
         mainContent={
            <MainContent sx={styles.fullHeight} onBackPosition="top-right">
               <Box sx={styles.mainContent}>
                  <Skeleton
                     sx={styles.confettiGraphic}
                     variant="rectangular"
                     width={100}
                     height={100}
                  />
                  <Typography sx={styles.title} variant={"h2"}>
                     <Skeleton width={300} />
                     {isMobile ? <Skeleton width={300} /> : null}
                  </Typography>
                  <Box component={Typography} sx={styles.description}>
                     {Array.from({ length: isMobile ? 6 : 4 }).map(
                        (_, index) => (
                           <Skeleton width="100%" key={index} />
                        )
                     )}
                     <Skeleton width="40%" />
                  </Box>
                  <Stack spacing={1} mt={4} sx={styles.buttons}>
                     <Skeleton
                        sx={styles.btn}
                        variant="rectangular"
                        height={40}
                     />
                     <Skeleton
                        sx={styles.btn}
                        variant="rectangular"
                        height={40}
                     />
                  </Stack>
               </Box>
            </MainContent>
         }
      />
   )
}

export default RegisterSuccessViewSkeleton
