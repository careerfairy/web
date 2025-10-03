import { Box, Card, Typography, useMediaQuery, useTheme } from "@mui/material"
import Stack from "@mui/material/Stack"
import useUniversitiesByCountryCodes from "components/custom-hook/useUniversities"
import { ClickIcon } from "components/views/common/icons/ClickIcon"
import { ConversionBadgeIcon } from "components/views/common/icons/ConversionBadgeIcon"
import { useMemo } from "react"
import { Eye } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useOfflineEventAnalyticsPageContext } from "../OfflineEventAnalyticsPageProvider"
import { ProgressBarItem } from "./ProgressBarItem"

const styles = sxStyles({
   container: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: { xs: 1, md: 2.5 },
      px: { xs: 2, md: 2 },
      pb: { xs: 1, md: 1.5 },
      pt: { xs: 0, md: 2.5 },
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
      flexDirection: "column",
      alignItems: "flex-start",
      gap: { xs: 0.5, md: 0 },
      p: { xs: 1.5, md: 1.5 },
   },
   statCardDesktop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
   },
   statCardLeft: {
      borderTopLeftRadius: "16px",
      borderBottomLeftRadius: "16px",
   },
   statCardRight: {
      borderTopRightRadius: "16px",
      borderBottomRightRadius: "16px",
      pl: { xs: 1.5, md: 4.5 },
   },
   iconContainer: {
      backgroundColor: "secondary.50",
      borderRadius: "44px",
      p: { xs: "4px", md: 1 },
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: { xs: 24, md: 48 },
      height: { xs: 24, md: 48 },
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
      width: { xs: 70, md: 70 },
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
      gap: { xs: 1.5, md: 1.25 },
   },
   sectionCard: {
      flex: 1,
      backgroundColor: (theme) => theme.brand.white[100],
      border: "1px solid",
      borderColor: "neutral.50",
      borderRadius: "16px",
      p: { xs: 1.5, md: 1.5 },
      display: "flex",
      flexDirection: "column",
      gap: { xs: 2, md: 2 },
   },
   progressSection: {
      backgroundColor: (theme) => theme.brand.white[300],
      borderRadius: "6px",
      p: { xs: 1.5, md: 1.5 },
      display: "flex",
      flexDirection: "column",
      gap: { xs: 1, md: 1 },
   },
   emptyState: {
      backgroundColor: (theme) => theme.brand.white[300],
      borderRadius: "6px",
      p: 1.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 174,
   },
   icon: {
      width: { xs: 16, md: 32 },
      height: { xs: 16, md: 32 },
      color: "secondary.600",
   },
})

const AggregatedAnalytics = () => {
   const theme = useTheme()
   const isMobile = useMediaQuery(theme.breakpoints.down("md"))
   const { currentEventStats, fieldsOfStudyLookup } =
      useOfflineEventAnalyticsPageContext()

   // Extract unique country codes from universityStats
   const countryCodes = useMemo(() => {
      if (!currentEventStats?.universityStats) return []
      const codes = Object.keys(currentEventStats.universityStats).map(
         (key) => key.split("_")[0]
      )
      return [...new Set(codes)]
   }, [currentEventStats])

   // Fetch universities for all country codes
   const fetchedUniversities = useUniversitiesByCountryCodes(countryCodes)

   // Create lookup map: countryCode_universityId -> University Name
   // The universityStats keys are in format: "{countryCode}_{universityId}"
   const universityLookup = useMemo(() => {
      const lookup: Record<string, string> = {}

      // Need to map each fetched university to its country code
      // Since we don't have direct country code on University, we need to track it during fetch
      // For now, we'll build the lookup by matching the university IDs from the stats keys
      if (!currentEventStats?.universityStats) return lookup

      const statsKeys = Object.keys(currentEventStats.universityStats)
      statsKeys.forEach((statsKey) => {
         const [, universityId] = statsKey.split("_")
         const university = fetchedUniversities.find(
            (u) => u.id === universityId
         )
         if (university) {
            lookup[statsKey] = university.name
         }
      })

      return lookup
   }, [fetchedUniversities, currentEventStats])

   // Calculate real stats from currentEventStats
   const stats = useMemo(() => {
      if (!currentEventStats) {
         return {
            totalTalentReached: 0,
            totalClicks: 0,
            conversionRate: 0,
            fieldsOfStudy: [],
            universities: [],
         }
      }

      const { generalStats, fieldOfStudyStats, universityStats } =
         currentEventStats

      // Get general stats
      const totalTalentReached = generalStats.uniqueNumberOfTalentReached || 0
      const totalClicks = generalStats.uniqueNumberOfRegisterClicks || 0
      const conversionRate =
         totalTalentReached > 0
            ? Math.round((totalClicks / totalTalentReached) * 100)
            : 0

      // Calculate fields of study percentages (relative to sum of all field stats)
      const fieldOfStudyEntries = Object.entries(fieldOfStudyStats || {})
      const totalFieldOfStudyReached = fieldOfStudyEntries.reduce(
         (sum, [, stats]) => sum + (stats.uniqueNumberOfTalentReached || 0),
         0
      )

      const fieldsOfStudy = fieldOfStudyEntries
         .map(([fieldId, stats]) => {
            const count = stats.uniqueNumberOfTalentReached || 0
            const percentage =
               totalFieldOfStudyReached > 0
                  ? (count / totalFieldOfStudyReached) * 100
                  : 0
            return {
               name: fieldsOfStudyLookup?.[fieldId] || fieldId,
               percentage: parseFloat(percentage.toFixed(1)),
               count,
            }
         })
         .filter((field) => field.count > 0)
         .sort((a, b) => b.count - a.count)
         .slice(0, 5)

      // Calculate university percentages (relative to sum of all university stats)
      const universityEntries = Object.entries(universityStats || {})
      const totalUniversityReached = universityEntries.reduce(
         (sum, [, stats]) => sum + (stats.uniqueNumberOfTalentReached || 0),
         0
      )

      const universitiesData = universityEntries
         .map(([universityKey, stats]) => {
            const count = stats.uniqueNumberOfTalentReached || 0
            const percentage =
               totalUniversityReached > 0
                  ? (count / totalUniversityReached) * 100
                  : 0
            return {
               name: universityLookup[universityKey] || "...",
               percentage: parseFloat(percentage.toFixed(1)),
               count,
            }
         })
         .filter((university) => university.count > 0)
         .sort((a, b) => b.count - a.count)
         .slice(0, 5)

      return {
         totalTalentReached,
         totalClicks,
         conversionRate,
         fieldsOfStudy,
         universities: universitiesData,
      }
   }, [currentEventStats, fieldsOfStudyLookup, universityLookup])

   const {
      totalTalentReached,
      totalClicks,
      conversionRate,
      fieldsOfStudy,
      universities,
   } = stats

   return (
      <Box sx={styles.container}>
         {/* Top Stats Row */}
         <Box sx={styles.statsRow}>
            <Card
               sx={[
                  styles.statCard,
                  styles.statCardLeft,
                  !isMobile && styles.statCardDesktop,
               ]}
               elevation={0}
            >
               <Box
                  sx={{
                     display: "flex",
                     alignItems: "center",
                     gap: 1,
                  }}
               >
                  <Box sx={styles.iconContainer}>
                     <Box component={Eye} sx={styles.icon} />
                  </Box>
                  <Typography variant="medium" color="neutral.600">
                     {isMobile ? "Reach" : "Total talent reached"}
                  </Typography>
               </Box>
               <Typography
                  variant={isMobile ? "brandedH3" : "desktopBrandedH3"}
                  fontWeight={700}
               >
                  {totalTalentReached.toLocaleString()}
               </Typography>
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

            <Card
               sx={[
                  styles.statCard,
                  styles.statCardRight,
                  !isMobile && styles.statCardDesktop,
               ]}
               elevation={0}
            >
               {!isMobile && <Box width={20} />}
               <Box
                  sx={{
                     display: "flex",
                     alignItems: "center",
                     gap: 1,
                  }}
               >
                  <Box sx={styles.iconContainer}>
                     <ClickIcon sx={styles.icon} />
                  </Box>
                  <Typography variant="medium" color="neutral.600">
                     {isMobile ? "Clicks" : "Total clicks"}
                  </Typography>
               </Box>
               <Typography
                  variant={isMobile ? "brandedH3" : "desktopBrandedH3"}
                  fontWeight={700}
               >
                  {totalClicks.toLocaleString()}
               </Typography>
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

               {fieldsOfStudy.length === 0 ? (
                  <Box sx={styles.emptyState}>
                     <Typography
                        variant="medium"
                        color="neutral.700"
                        textAlign="center"
                     >
                        Not enough data to display fields of study breakdown
                     </Typography>
                  </Box>
               ) : (
                  <Box sx={styles.progressSection}>
                     {fieldsOfStudy.map((field, index) => (
                        <ProgressBarItem
                           key={index}
                           name={field.name}
                           percentage={field.percentage}
                           isMobile={isMobile}
                        />
                     ))}
                  </Box>
               )}
            </Box>

            {/* Universities */}
            <Box sx={styles.sectionCard}>
               <Typography
                  variant="brandedH5"
                  sx={{ fontWeight: 600, lineHeight: "28px" }}
               >
                  Top 5 universities
               </Typography>

               {universities.length === 0 ? (
                  <Box sx={styles.emptyState}>
                     <Typography
                        variant="medium"
                        color="neutral.700"
                        textAlign="center"
                     >
                        Not enough data to display universities breakdown
                     </Typography>
                  </Box>
               ) : (
                  <Box sx={styles.progressSection}>
                     {universities.map((university, index) => (
                        <ProgressBarItem
                           key={index}
                           name={university.name}
                           percentage={university.percentage}
                           isMobile={isMobile}
                        />
                     ))}
                  </Box>
               )}
            </Box>
         </Stack>
      </Box>
   )
}

export default AggregatedAnalytics
