import { Group } from "@careerfairy/shared-lib/groups"
import { InteractionSources, InteractionSourcesType } from "@careerfairy/shared-lib/groups/telemetry"
import { Avatar, Box, Typography } from "@mui/material"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import FollowButton from "components/views/common/company/FollowButton"
import Link from "next/link"
import { sxStyles } from "types/commonTypes"
import { makeGroupCompanyPageUrl } from "util/makeUrls"

const styles = sxStyles({
   companyCard: {
      backgroundColor: "common.white",
      border: (theme) => `1px solid ${theme.brand.purple[50]}`,
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0px 0px 12px 0px rgba(20, 20, 20, 0.08)",
      flexShrink: 0,
      userSelect: "none",
      cursor: "pointer",
      transition: "box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out",
      "&:hover": {
         boxShadow: "0px 0px 16px 0px rgba(20, 20, 20, 0.12)",
         borderColor: (theme) => theme.brand.purple[100],
      },
      // Let the parent container (Grid) control the sizing
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
   },
   companyCardLarge: {
      // For carousel usage, maintain fixed width
      width: "254px",
      minWidth: "254px",
      height: "auto", // Allow height to be determined by content
   },
   companyCardSmall: {
      // For grid usage, let Grid system control sizing
      width: "100%",
      maxWidth: "100%",
      minWidth: { xs: "unset", sm: "165px" },
      height: "100%",
      alignSelf: "center",
      borderRadius: "11px",
      boxShadow: "0px 0px 5px 0px rgba(20, 20, 20, 0.06)",
      border: (theme) => `0.7px solid ${theme.brand.purple[50]}`,
   },
   companyBanner: {
      backgroundSize: "cover",
      backgroundPosition: "center",
   },
   companyBannerLarge: {
      height: "85px",
   },
   companyBannerSmall: {
      height: "58px",
   },
   companyContent: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      position: "relative",
      marginTop: "-40px",
      flex: 1,
      justifyContent: "space-between",
   },
   companyContentLarge: {
      padding: "12px",
   },
   companyContentSmall: {
      padding: "8px",
      marginTop: "-28px",
      gap: 1.5,
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
      flex: 1,
      justifyContent: "center",
   },
   companyTextContentSmall: {
      gap: 0.5,
   },
   companyAvatar: {
      border: (theme) => `1.5px solid ${theme.brand.white[400]}`,
   },
   companyAvatarLarge: {
      width: 64,
      height: 64,
   },
   companyAvatarSmall: {
      width: 44,
      height: 44,
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
   },
   companyName: {
      color: "neutral.800",
      fontWeight: 700,
   },
   companyFollowText: {
      color: "neutral.400",
   },
   followButton: {
      width: "100%",
      borderRadius: "18px",
   },
   followButtonSmall: {
      padding: "5.466px 10.931px",
   },
   actionArea: {},
})

interface CompanyCardProps {
   company: Group
   variant?: "large" | "small"
   interactionSource?: InteractionSourcesType
}

export const CompanyCard = ({
   company,
   variant = "large",
   interactionSource = InteractionSources.Panels_Overview_Page,
}: CompanyCardProps) => {
   const isSmall = variant === "small"

   return (
      <Box
         key={company.id}
         sx={[
            styles.companyCard,
            isSmall ? styles.companyCardSmall : styles.companyCardLarge,
         ]}
         component={Link}
         href={makeGroupCompanyPageUrl(company.universityName, {
            interactionSource,
         })}
      >
         <Box
            sx={[
               styles.companyBanner,
               isSmall ? styles.companyBannerSmall : styles.companyBannerLarge,
               {
                  backgroundImage: `url(${getResizedUrl(
                     company.bannerImageUrl,
                     "md"
                  )})`,
               },
            ]}
         />
         <Box
            sx={[
               styles.companyContent,
               isSmall
                  ? styles.companyContentSmall
                  : styles.companyContentLarge,
            ]}
         >
            <Box sx={styles.companyAvatarContainer}>
               <Avatar
                  sx={[
                     styles.companyAvatar,
                     isSmall
                        ? styles.companyAvatarSmall
                        : styles.companyAvatarLarge,
                  ]}
                  src={getResizedUrl(company.logoUrl, "sm")}
                  alt={company.universityName}
               />
            </Box>
            <Box
               sx={[
                  styles.companyTextContent,
                  isSmall && styles.companyTextContentSmall,
               ]}
            >
               <Typography
                  variant={isSmall ? "xsmall" : "brandedH5"}
                  sx={[styles.companyName]}
               >
                  {company.universityName}
               </Typography>
            </Box>
            <FollowButton
               group={company}
               interactionSource={InteractionSources.Live_Stream_Details}
               sx={[styles.followButton, isSmall && styles.followButtonSmall]}
               showStartIcon={false}
            />
         </Box>
      </Box>
   )
}
