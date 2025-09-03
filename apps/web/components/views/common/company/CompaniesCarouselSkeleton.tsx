import { Box, Card, Skeleton } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   companyCard: {
      backgroundColor: "common.white",
      border: (theme) => `1px solid ${theme.palette.neutral[100]}`,
      borderRadius: "16px",
      overflow: "hidden",
      width: "254px",
      minWidth: "254px",
      boxShadow: "0px 0px 8px 0px rgba(20, 20, 20, 0.06)",
      flexShrink: 0,
   },
   companyBanner: {
      height: "85px",
   },
   companyContent: {
      padding: "12px",
      display: "flex",
      flexDirection: "column",
      gap: 2,
      position: "relative",
      marginTop: "-40px",
   },
   companyAvatarContainer: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
   },
   companyAvatar: {
      width: 64,
      height: 64,
      border: (theme) => `1.5px solid ${theme.brand.white[400]}`,
   },
})

export const CompaniesCarouselSkeleton = ({
   title,
}: {
   title?: string | ReactNode
}) => {
   const isMobile = useIsMobile()
   const skeletonCount = 3

   return (
      <ContentCarousel
         slideWidth={254}
         headerTitle={title}
         disableArrows={isMobile}
         viewportSx={{
            // hack to ensure overflow visibility with parent padding
            paddingX: "16px",
            marginX: "-16px",
            width: "calc(100% + 32px)", // Account for parent container padding (16px on each side)
         }}
         emblaProps={{
            emblaOptions: {
               dragFree: true,
               skipSnaps: true,
               loop: false,
               axis: "x",
            },
         }}
      >
         {Array.from({ length: skeletonCount }).map((_, index) => (
            <Card key={index} sx={styles.companyCard}>
               <Skeleton
                  variant="rectangular"
                  sx={styles.companyBanner}
                  animation="wave"
               />
               <Box sx={styles.companyContent}>
                  <Box sx={styles.companyAvatarContainer}>
                     <Skeleton
                        variant="circular"
                        sx={styles.companyAvatar}
                        animation="wave"
                     />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                     <Skeleton
                        variant="text"
                        width="80%"
                        height={24}
                        animation="wave"
                     />
                  </Box>
                  <Skeleton
                     variant="rectangular"
                     height={36}
                     sx={{ borderRadius: "18px" }}
                     animation="wave"
                  />
               </Box>
            </Card>
         ))}
      </ContentCarousel>
   )
}
