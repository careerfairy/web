import { Box, Grid, Typography, styled } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { sxStyles } from "types/commonTypes"
import BaseDialogView from "../../BaseDialogView"
import { GetNotifiedCard } from "./GetNotifiedCard"
import { RecommendationsNav } from "./RecommendationsNav"

const styles = sxStyles({
   root: {
      padding: [0, "!important"],
      height: "100%",
      width: "100%",
      overflow: "auto",
   },
   container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 4,
      zIndex: 1,
      position: "relative",
      overflowY: "auto",
      overflowX: "hidden",
      width: "100%",
      minHeight: "100%",
   },
   title: {
      color: "common.white",
      mb: 2,
      fontWeight: 600,
      textShadow: "0px 0px 8px rgba(0,0,0,0.5)",
   },
   variantLabel: {
      color: "common.white",
      mb: 1,
      fontWeight: 500,
      textShadow: "0px 0px 8px rgba(0,0,0,0.5)",
   },
   gridContainer: {
      width: "100%",
      maxWidth: 1200,
   },
})

const Layout = styled(Box)({
   minHeight: "100%",
   position: "relative",
})

const RecommendationsView = () => {
   const isMobile = useIsMobile()

   return (
      <BaseDialogView
         sx={styles.root}
         mainContent={
            <Layout>
               <Box sx={styles.container}>
                  <Typography variant="h4" sx={styles.title}>
                     GetNotifiedCard - All Variants
                  </Typography>

                  <Grid
                     container
                     spacing={4}
                     sx={styles.gridContainer}
                     justifyContent="center"
                  >
                     {/* Mobile Variants */}
                     <Grid
                        item
                        xs={12}
                        md={6}
                        lg={6}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                     >
                        <Typography variant="h6" sx={styles.variantLabel}>
                           Mobile - App Download Variant
                        </Typography>
                        <GetNotifiedCard
                           responsiveMode="mobile"
                           isAppDownloaded={false}
                           onClose={() => console.log("Card closed")}
                        />
                     </Grid>

                     <Grid
                        item
                        xs={12}
                        md={6}
                        lg={6}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                     >
                        <Typography variant="h6" sx={styles.variantLabel}>
                           Mobile - Calendar Only Variant
                        </Typography>
                        <GetNotifiedCard
                           isAppDownloaded={true}
                           responsiveMode="mobile"
                           onClose={() => console.log("Card closed")}
                        />
                     </Grid>

                     {/* Desktop Variants */}
                     <Grid
                        item
                        xs={12}
                        md={6}
                        lg={6}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                     >
                        <Typography variant="h6" sx={styles.variantLabel}>
                           Desktop - App Download Variant
                        </Typography>
                        <GetNotifiedCard
                           responsiveMode="desktop"
                           isExpanded={false}
                           isAppDownloaded={false}
                           onClose={() => console.log("Card closed")}
                        />
                     </Grid>

                     <Grid
                        item
                        xs={12}
                        md={6}
                        lg={6}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                     >
                        <Typography variant="h6" sx={styles.variantLabel}>
                           Desktop - Calendar Only Variant
                        </Typography>
                        <GetNotifiedCard
                           responsiveMode="desktop"
                           isExpanded={false}
                           isAppDownloaded={true}
                           onClose={() => console.log("Card closed")}
                        />
                     </Grid>

                     {/* Desktop Expanded Variants */}
                     <Grid
                        item
                        xs={12}
                        md={12}
                        lg={12}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                     >
                        <Typography variant="h6" sx={styles.variantLabel}>
                           Desktop Expanded - App Download Variant
                        </Typography>
                        <GetNotifiedCard
                           responsiveMode="desktop"
                           isExpanded={true}
                           isAppDownloaded={false}
                           onClose={() => console.log("Card closed")}
                        />
                     </Grid>

                     <Grid
                        item
                        xs={12}
                        md={12}
                        lg={12}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                     >
                        <Typography variant="h6" sx={styles.variantLabel}>
                           Desktop Expanded - Calendar Only Variant
                        </Typography>
                        <GetNotifiedCard
                           responsiveMode="desktop"
                           isExpanded={true}
                           isAppDownloaded={true}
                           onClose={() => console.log("Card closed")}
                        />
                     </Grid>
                  </Grid>
               </Box>

               {Boolean(isMobile) && <RecommendationsNav />}
            </Layout>
         }
      />
   )
}

export default RecommendationsView
