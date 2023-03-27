import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import React, { memo, useCallback, useMemo, useState } from "react"
import { sxStyles } from "types/commonTypes"
import Sources from "../../analytics/RegistrationSources"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useTimeFramedLivestreamStats from "../general/search-filter/useTimeFramedLivestreamStats"
import { TimeFrame } from "../general/search-filter/GeneralSearchFilter"
import Button from "@mui/material/Button"
import { useTheme } from "@mui/styles"

const styles = sxStyles({
   timeFrameWrapper: {
      display: "flex",
      width: "100%",
      justifyContent: "end",
      mx: 3,
   },
   timeFrameOptions: {
      display: "flex",
      alignItems: "center",
      background: "#FAEDF2",
      borderRadius: "6px",
      marginTop: 4,
      height: "40px",
      px: 1,
   },
   timeFrameButton: {
      borderRadius: "6px",
      height: "30px",
   },
})

const AnalyticsRegistrationSourcesPageContent = () => {
   // All necessary providers can be added here
   return <MemoizedPageContent />
}
type TimeFrameOption = {
   id: string
   value: TimeFrame
   label: string
}

const timeFrameOptions: TimeFrameOption[] = [
   {
      id: "last-year",
      value: "Last 1 year",
      label: "Year",
   },
   {
      id: "last-month",
      value: "Last 30 days",
      label: "Month",
   },
   {
      id: "all-time",
      value: "All time",
      label: "Max",
   },
]

const PageContent = () => {
   const { group } = useGroup()
   const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrameOption>(
      timeFrameOptions[0]
   )
   const {
      palette: { secondary, grey },
   } = useTheme()
   const { data: livestreamStats } = useTimeFramedLivestreamStats(
      selectedTimeFrame.value
   )

   const isLoading = livestreamStats === undefined
   const mappedEvents = useMemo(
      () =>
         livestreamStats?.map(
            (stream) => stream.livestream as LivestreamEvent
         ) || [],
      [livestreamStats]
   )

   const handleTimeFrameChange = (timeFrame: TimeFrameOption) => {
      setSelectedTimeFrame(timeFrame)
   }

   const isSelected = useCallback(
      (timeFrame: TimeFrameOption) => timeFrame.id === selectedTimeFrame.id,
      [selectedTimeFrame.id]
   )

   return (
      <Box py={2}>
         <Container maxWidth={false}>
            <Grid container spacing={spacing}>
               <Box sx={styles.timeFrameWrapper}>
                  <Box sx={styles.timeFrameOptions}>
                     {timeFrameOptions.map((timeFrame) => (
                        <Button
                           key={timeFrame.id}
                           sx={[
                              styles.timeFrameButton,
                              {
                                 color: isSelected(timeFrame)
                                    ? "white"
                                    : grey.dark,
                                 backgroundColor: isSelected(timeFrame)
                                    ? secondary.main
                                    : "unset",
                              },
                           ]}
                           onClick={() => handleTimeFrameChange(timeFrame)}
                        >
                           {timeFrame.label}
                        </Button>
                     ))}
                  </Box>
               </Box>

               <Sources
                  group={group}
                  loading={isLoading}
                  streamsFromTimeFrameAndFuture={mappedEvents}
               />
            </Grid>
         </Container>
      </Box>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default AnalyticsRegistrationSourcesPageContent
