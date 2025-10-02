import { Box, Card, LinearProgress, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import { ClickIcon } from "components/views/common/icons/ClickIcon"
import { ConversionBadgeIcon } from "components/views/common/icons/ConversionBadgeIcon"
import { Eye } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useOfflineEventAnalyticsPageContext } from "../OfflineEventAnalyticsPageProvider"

const styles = sxStyles({
   container: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 2.5,
      px: 2,
      pb: 1.5,
      pt: 2.5,
   },
   statsRow: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      position: "relative",
   },
   statCard: {
      flex: 1,
      backgroundColor: (theme) => theme.brand.white[200],
      border: "1px solid",
      borderColor: "neutral.50",
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 1.5,
   },
   statCardLeft: {
      borderTopLeftRadius: "16px",
      borderBottomLeftRadius: "16px",
   },
   statCardRight: {
      borderTopRightRadius: "16px",
      borderBottomRightRadius: "16px",
   },
   iconContainer: {
      backgroundColor: "secondary.50",
      borderRadius: "44px",
      p: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 48,
      height: 48,
   },
   conversionBadge: {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translateX(-50%) translateY(-50%)",
      height: "100%",
   },
   conversionBox: {
      position: "relative",
      width: 70,
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   conversionIcon: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      scale: 1.02,
   },
   conversionText: {
      position: "absolute",
   },
   topSection: {
      display: "flex",
      flexDirection: "column",
      gap: 1.25,
   },
   sectionCard: {
      flex: 1,
      backgroundColor: (theme) => theme.brand.white[100],
      border: "1px solid",
      borderColor: "neutral.50",
      borderRadius: "16px",
      p: 1.5,
      display: "flex",
      flexDirection: "column",
      gap: 2,
   },
   progressSection: {
      backgroundColor: (theme) => theme.brand.white[300],
      borderRadius: "6px",
      p: 1.5,
      display: "flex",
      flexDirection: "column",
      gap: 1,
   },
   progressRow: {
      display: "flex",
      alignItems: "center",
      gap: 1.5,
   },
   progressBarContainer: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 2,
   },
   progressBar: {
      flex: 1,
      height: 17,
      borderRadius: "27px",
      backgroundColor: "neutral.50",
      "& .MuiLinearProgress-bar": {
         borderRadius: "27px",
         backgroundColor: "secondary.600",
      },
   },
   icon: {
      width: 32,
      height: 32,
      color: "secondary.600",
   },
})

const AggregatedAnalytics = () => {
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const { currentEventStats } = useOfflineEventAnalyticsPageContext()

   // Dummy data for now
   const totalTalentReached = 1320
   const totalClicks = 689
   const conversionRate = 52

   const fieldsOfStudy = [
      { name: "Computer science", percentage: 16.8, width: 107 },
      { name: "Mechanical engineering", percentage: 10.1, width: 73 },
      { name: "Business engineering", percentage: 9.7, width: 62 },
      { name: "Physics", percentage: 8.2, width: 49 },
      { name: "Mathematics", percentage: 7.3, width: 40 },
   ]

   const universities = [
      { name: "ETH Zurich", percentage: 23.6, width: 110.4 },
      { name: "University of Zurich", percentage: 19.3, width: 75.44 },
      { name: "EPF Lausanne", percentage: 11.8, width: 58 },
      { name: "ZHAW", percentage: 9.2, width: 48 },
      { name: "University of St. Gallen", percentage: 8.2, width: 38 },
   ]

   return (
      <Box sx={styles.container}>
         {/* Top Stats Row */}
         <Box sx={styles.statsRow}>
            <Card sx={[styles.statCard, styles.statCardLeft]} elevation={0}>
               <Box sx={styles.iconContainer}>
                  <Box component={Eye} sx={styles.icon} />
               </Box>
               <Stack flex={1}>
                  <Typography variant="medium" color="neutral.600">
                     Total talent reached
                  </Typography>
                  <Typography variant="desktopBrandedH3" fontWeight={700}>
                     {totalTalentReached.toLocaleString()}
                  </Typography>
               </Stack>
            </Card>

            {/* Conversion Badge */}
            <Box sx={styles.conversionBadge}>
               <Box sx={styles.conversionBox}>
                  <ConversionBadgeIcon sx={styles.conversionIcon} />
                  <Box sx={styles.conversionText}>
                     <Typography
                        variant="small"
                        color="neutral.700"
                        textAlign="center"
                     >
                        {conversionRate}%
                     </Typography>
                  </Box>
               </Box>
            </Box>

            <Card sx={[styles.statCard, styles.statCardRight]} elevation={0}>
               <Box width={20} />
               <Box sx={styles.iconContainer}>
                  <ClickIcon sx={styles.icon} />
               </Box>
               <Stack flex={1}>
                  <Typography variant="medium" color="neutral.600">
                     Total clicks
                  </Typography>
                  <Typography variant="desktopBrandedH3" fontWeight={700}>
                     {totalClicks.toLocaleString()}
                  </Typography>
               </Stack>
            </Card>
         </Box>

         {/* Bottom Section with Progress Bars */}
         <Stack
            direction={{
               xs: "column",
               md: "row",
            }}
            spacing={2.5}
         >
            {/* Fields of Study */}
            <Box sx={styles.sectionCard}>
               <Typography
                  variant="brandedH5"
                  sx={{ fontWeight: 600, lineHeight: "28px" }}
               >
                  Top 5 fields of study
               </Typography>

               <Box sx={styles.progressSection}>
                  {fieldsOfStudy.map((field, index) => (
                     <Box key={index} sx={styles.progressRow}>
                        <Box sx={styles.progressBarContainer}>
                           <Typography
                              variant="medium"
                              color="neutral.700"
                              sx={{
                                 width: 200,
                                 lineHeight: "24px",
                                 whiteSpace: "nowrap",
                                 overflow: "hidden",
                                 textOverflow: "ellipsis",
                              }}
                           >
                              {field.name}
                           </Typography>
                           <LinearProgress
                              variant="determinate"
                              value={field.percentage}
                              sx={styles.progressBar}
                           />
                        </Box>
                        <Typography
                           variant="xsmall"
                           color={(theme) => theme.brand.black[700]}
                           sx={{
                              width: 52,
                              textAlign: "right",
                              lineHeight: "16px",
                           }}
                        >
                           {field.percentage}%
                        </Typography>
                     </Box>
                  ))}
               </Box>
            </Box>

            {/* Universities */}
            <Box sx={styles.sectionCard}>
               <Typography
                  variant="brandedH5"
                  sx={{ fontWeight: 600, lineHeight: "28px" }}
               >
                  Top 5 universities
               </Typography>

               <Box sx={styles.progressSection}>
                  {universities.map((university, index) => (
                     <Box key={index} sx={styles.progressRow}>
                        <Box sx={styles.progressBarContainer}>
                           <Typography
                              variant="medium"
                              color="neutral.700"
                              sx={{
                                 width: 200,
                                 lineHeight: "24px",
                                 whiteSpace: "nowrap",
                                 overflow: "hidden",
                                 textOverflow: "ellipsis",
                              }}
                           >
                              {university.name}
                           </Typography>
                           <LinearProgress
                              variant="determinate"
                              value={university.percentage}
                              sx={styles.progressBar}
                           />
                        </Box>
                        <Typography
                           variant="xsmall"
                           color={(theme) => theme.brand.black[700]}
                           sx={{
                              width: 52,
                              textAlign: "right",
                              lineHeight: "16px",
                           }}
                        >
                           {university.percentage}%
                        </Typography>
                     </Box>
                  ))}
               </Box>
            </Box>
         </Stack>
      </Box>
   )
}

export default AggregatedAnalytics
