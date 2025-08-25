import { Group } from "@careerfairy/shared-lib/groups"
import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { Avatar, Box, Card, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import FollowButton from "components/views/common/company/FollowButton"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
import { CompaniesCarouselSkeleton } from "./CompaniesCarouselSkeleton"

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
      backgroundSize: "cover",
      backgroundPosition: "center",
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
   companyTextContent: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      alignItems: "center",
      textAlign: "center",
      width: "100%",
   },
   companyAvatar: {
      width: 64,
      height: 64,
      border: (theme) => `1.5px solid ${theme.brand.white[400]}`,
   },
   companyName: {
      color: "neutral.800",
   },
   companyFollowText: {
      color: "neutral.400",
   },
   followButton: {
      width: "100%",
      borderRadius: "18px",
   },
})

export const CompaniesCarousel = ({
   companies,
   title,
   isLoading,
}: {
   companies: Group[]
   title?: string | ReactNode
   isLoading?: boolean
}) => {
   const isMobile = useIsMobile()

   if (isLoading) {
      return <CompaniesCarouselSkeleton title={title} />
   }

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
         {companies.map((company) => (
            <Card key={company.id} sx={styles.companyCard}>
               <Box
                  sx={[
                     styles.companyBanner,
                     {
                        backgroundImage: `url(${getResizedUrl(
                           company.bannerImageUrl,
                           "md"
                        )})`,
                     },
                  ]}
               />
               <Box sx={styles.companyContent}>
                  <Box sx={styles.companyAvatarContainer}>
                     <Avatar
                        sx={styles.companyAvatar}
                        src={getResizedUrl(company.logoUrl, "sm")}
                        alt={company.universityName}
                     />
                  </Box>
                  <Box sx={styles.companyTextContent}>
                     <Typography
                        variant="brandedH5"
                        sx={[styles.companyName, { fontWeight: 700 }]}
                     >
                        {company.universityName}
                     </Typography>
                  </Box>
                  <FollowButton
                     group={company}
                     interactionSource={InteractionSources.Live_Stream_Details}
                     sx={styles.followButton}
                     showStartIcon={false}
                  />
               </Box>
            </Card>
         ))}
      </ContentCarousel>
   )
}
