import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Avatar, Box, Button, Stack, Typography } from "@mui/material"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"
import { PanelDateBadge } from "./base/PanelCardBase"

const styles = sxStyles({
   panelCard: {
      alignContent: "center",
      alignSelf: "stretch",
      padding: "16px 12px",
      borderRadius: "11px",
      overflow: "hidden",
      position: "relative",
      minHeight: { xs: "300px", tablet: "350px", desktop: "394px" },
      cursor: "pointer",
      transition: "transform 0.2s ease-in-out",
      width: "100%",
      "&:hover": {
         "& .panelBackground": {
            transform: "scale(1.05)",
         },
      },
   },
   panelBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundSize: "cover",
      backgroundPosition: "right center",
      transition: "transform 0.3s ease-in-out",
      "&::before": {
         content: '""',
         position: "absolute",
         inset: 0,
         background: `linear-gradient(90deg, rgb(10, 8, 3) 37.547%, rgba(10, 8, 3, 0) 67.067%), linear-gradient(90deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.10) 100%), linear-gradient(rgba(0, 0, 0, 0) 65.561%, rgba(0, 0, 0, 0.80) 100%)`,
      },
   },
   panelContent: {
      position: "relative",
      zIndex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 3,
      maxWidth: { xs: "60%", tablet: "255px" },
   },
   panelDate: {
      position: "absolute",
      top: 0,
      right: 13,
      backgroundColor: (theme) => theme.brand.white[100],
      borderRadius: "0 0 5.5px 5.5px",
      px: 1.5,
      pt: 1.4,
      pb: 1.8,
      textAlign: "center",
      minWidth: "51px",
      height: "59px",
      boxShadow: "0px 0px 11px 0px rgba(20, 20, 20, 0.08)",
   },
   panelCompanyAvatar: {
      width: 33,
      height: 33,
      bgcolor: (theme) => theme.brand.white[100],
   },
   panelPoints: { gap: 1 },
   panelPoint: { gap: 0.5, alignItems: "flex-start" },
   panelPointIcon: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      backgroundColor: (theme) => theme.palette.neutral[50],
      opacity: 0.52,
      mt: 1,
   },
   panelPointText: {
      flex: "1 0 0",

      color: (theme) => theme.brand.white[100],
   },
   panelCompanies: { gap: 0.5 },
   registerButton: {
      backgroundColor: (theme) => theme.brand.white[100],
      color: "neutral.600",
      padding: "8px 24px",
      whiteSpace: "nowrap",
      border: "1px solid",
      borderColor: "neutral.400",
      alignSelf: { xs: "stretch", tablet: "flex-start" },
      "&:hover": { backgroundColor: "neutral.50" },
   },
   masterclassLogoContainer: {
      width: { xs: "216px", tablet: "216px", desktop: "297px" },
   },
})

export const ReasonsToJoinPanelCard = ({
   panel,
   companies,
   handleOpenLivestreamDialog,
}: {
   panel: LivestreamEvent
   companies: Group[]
   handleOpenLivestreamDialog: (livestreamId: string) => void
}) => {
   const panelCompanies = companies.filter((company) =>
      panel.groupIds.includes(company.id)
   )
   return (
      <Box
         sx={styles.panelCard}
         onClick={() => handleOpenLivestreamDialog(panel.id)}
      >
         <Box
            className="panelBackground"
            sx={{
               ...styles.panelBackground,
               backgroundImage: `url(${panel.backgroundImageUrl})`,
            }}
         />

         <PanelDateBadge startDate={panel.startDate} variant="default" />

         <Stack sx={styles.panelContent}>
            <Stack sx={styles.panelCompanies}>
               <Stack direction="row" sx={{ gap: 0.5 }}>
                  {panelCompanies.map((company, idx) => (
                     <Avatar
                        key={idx}
                        src={company.logoUrl}
                        sx={styles.panelCompanyAvatar}
                     />
                  ))}
               </Stack>
            </Stack>

            {Boolean(panel.panelLogoUrl) && (
               <Box sx={styles.masterclassLogoContainer}>
                  <Image
                     src={getResizedUrl(panel.panelLogoUrl, "lg")}
                     alt="Panel Logo"
                     width={0}
                     height={0}
                     sizes="100vw"
                     style={{
                        width: "auto",
                        height: "auto",
                        maxWidth: "100%",
                     }}
                     priority
                  />
               </Box>
            )}

            <Stack sx={styles.panelPoints}>
               {panel.reasonsToJoinLivestream_v2.map((point, idx) => (
                  <Stack key={idx} direction="row" sx={styles.panelPoint}>
                     <Box sx={styles.panelPointIcon} />
                     <Typography variant="small" sx={styles.panelPointText}>
                        {point.trim()}
                     </Typography>
                  </Stack>
               ))}
            </Stack>

            <Button sx={styles.registerButton}>Register now</Button>
         </Stack>
      </Box>
   )
}
