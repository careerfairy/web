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
      height: "100%",
   },
   mainContentWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   contentWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      alignItems: "center",
      width: "100%",
   },
   header: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      width: "100%",
      alignItems: "center",
   },
   confettiGraphic: {
      width: "100%",
      textAlign: "center",
      mb: 2,
   },
   title: {
      textAlign: "center",
      pt: { xs: 1, md: 0 },
      mb: 3,
   },
   description: {
      textAlign: "center",
      fontSize: "1.142rem",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      maxWidth: 680,
      gap: 1,
   },
   btn: {
      borderRadius: 8,
   },
   buttons: {
      maxWidth: 300,
      width: "100%",
   },
})

const RegisterSuccessViewSkeleton: FC = () => {
   const isMobile = useIsMobile()

   return (
      <BaseDialogView
         sx={styles.fullHeight}
         mainContent={
            <MainContent
               sx={[styles.fullHeight, styles.mainContentWrapper]}
               onBackPosition="top-right"
            >
               <Box sx={styles.contentWrapper}>
                  <Box id="header" sx={styles.header}>
                     <Skeleton
                        sx={styles.confettiGraphic}
                        variant="rectangular"
                        width={isMobile ? 144 : 192}
                        height={isMobile ? 144 : 192}
                     />
                     <Typography sx={styles.title} variant={"h2"}>
                        <Skeleton width={isMobile ? 300 : 600} />
                     </Typography>
                  </Box>

                  <Box component={Typography} sx={styles.description}>
                     {Array.from({ length: isMobile ? 5 : 3 }).map(
                        (_, index) => (
                           <Skeleton width="100%" key={index} />
                        )
                     )}
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
