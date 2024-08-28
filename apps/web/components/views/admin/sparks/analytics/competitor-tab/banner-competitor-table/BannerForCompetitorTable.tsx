import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "relative",
      width: "100%",
      display: "grid",
      gridTemplateColumns: {
         xs: "unset",
         md: "53% 47%",
      },
      gridTemplateRows: {
         xs: "1fr 1fr",
         md: "unset",
      },
      gap: 1,
      borderRadius: "8px",
      background: (theme) => theme.palette.secondary.light,
      overflow: "hidden",
      height: {
         xs: "443px",
         md: "unset",
      },
      minHeight: {
         xs: "443px",
         md: "259px",
      },
      maxWidth: {
         xs: "100%",
         md: "1135px",
      },
   },
   copyWrapper: {
      padding: {
         xs: "16px 12px",
         md: "58px 37px",
      },
   },
   title: {
      color: (theme) => theme.palette.neutral["800"],
      fontWeight: 700,
   },
   comingSoon: (theme) => ({
      color: theme.palette.common.white,
      transform: "rotate(-1deg)",
      display: "inline-block",
      padding: "0px 9px",
      borderRadius: "4px",
      backgroundColor: theme.palette.secondary["500"],
   }),
   message: {
      color: (theme) => theme.palette.neutral["700"],
   },
   imageContainer: {
      position: "relative",
   },
   ellipseWrapper: {
      position: "absolute",
      top: {
         xs: -50,
         sm: -140,
         md: -48,
      },
      right: {
         xs: -50,
         md: -48,
      },
      zIndex: 1,
   },
   ellipse: {
      position: "relative",
      width: "261px",
      height: "261px",
      borderRadius: "261px",
      border: (theme) => `30px solid ${theme.palette.secondary["100"]}`,
   },
   imageWrapper: {
      position: "absolute",
      transform: {
         xs: "none",
         sm: "scale(2)",
         md: "none",
      },
      bottom: {
         xs: -20,
         md: -38,
      },
      right: {
         xs: -70,
         sm: 80,
         md: -20,
      },
      zIndex: 2,
   },
})

export const BannerForCompetitorTable = () => {
   const isMobile = useIsMobile()

   return (
      <Box sx={styles.root}>
         <Stack sx={styles.copyWrapper} spacing={1} zIndex={3}>
            <Typography variant="brandedH3" sx={styles.title}>
               New Competitor Table{" "}
               <Box component="span" sx={styles.comingSoon}>
                  <Typography variant="brandedH3">Coming Soon</Typography>
               </Box>{" "}
               !
            </Typography>
            <Typography variant="brandedBody" sx={styles.message}>
               {`Compare your company's performance with other brands and gain exclusive insights on your employer brand perception. Discover industry leaders and see their top-performing Sparks. Stay ahead of the competition!`}
            </Typography>
         </Stack>
         <Box sx={styles.imageContainer}>
            <Box sx={styles.ellipseWrapper}>
               <Box sx={styles.ellipse} />
            </Box>
            <Box sx={styles.imageWrapper}>
               <Image
                  src={
                     "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/table-banner.png?alt=media&token=860db97b-7ec3-4874-9301-140af83996b4"
                  }
                  alt="coming soon table banner"
                  width={isMobile ? 450 : 589}
                  height={isMobile ? 214 : 281}
               />
            </Box>
         </Box>
      </Box>
   )
}
