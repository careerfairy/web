import { LIVESTREAM_REPLICAS } from "@careerfairy/shared-lib/livestreams/search"
import { Box, Card } from "@mui/material"
import Stack from "@mui/material/Stack"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import { Search as FindIcon } from "react-feather"
import { LivestreamSearchResult } from "types/algolia"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { sxStyles } from "../../../../../../../types/commonTypes"
import ExportPdfButton from "../../../common/ExportPDFButton"
import LivestreamSearch from "../../../common/LivestreamSearch"
import { useLivestreamsAnalyticsPageContext } from "../LivestreamAnalyticsPageProvider"
import UserTypeTabs from "./UserTypeTabs"

const spacing = 3

const styles = sxStyles({
   wrapper: {
      flex: 1,
   },
   searchWrapper: {
      flex: 1,
      width: "100%",
   },
   searchCard: {
      flex: 1,
      display: "flex",
   },
})

const LivestreamSearchNav = () => {
   const { currentStreamStats } = useLivestreamsAnalyticsPageContext()
   const { push } = useRouter()
   const { group } = useGroup()
   const [inputValue, setInputValue] = useState("")

   const handleChange = useCallback(
      (newValue: LivestreamSearchResult | null) => {
         void push(
            `/group/${group.id}/admin/analytics/live-stream/${
               newValue?.id ?? ""
            }`,
            undefined,
            { shallow: true }
         )
      },
      [group.id, push]
   )

   return (
      <Stack
         sx={styles.wrapper}
         spacing={spacing}
         direction={{ xs: "column", sm: "row" }}
         alignItems={{ xs: "stretch", sm: "center" }}
      >
         <Box sx={styles.searchWrapper} flex={1}>
            <Card sx={styles.searchCard}>
               <LivestreamSearch
                  targetReplica={LIVESTREAM_REPLICAS.START_DESC}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  handleChange={handleChange}
                  value={
                     (currentStreamStats?.livestream as LivestreamSearchResult) ??
                     null
                  }
                  startIcon={<FindIcon color={"black"} />}
                  placeholderText="Search by title"
                  includeHiddenEvents
                  filterOptions={{
                     arrayFilters: {
                        groupIds: [group.id],
                     },
                  }}
               />
            </Card>
         </Box>
         <Stack minHeight={53} height="100%" direction="row" spacing={2}>
            <UserTypeTabs />
            <ExportPdfButton
               livestreamId={currentStreamStats?.livestream?.id}
               groupId={group.id}
               size="large"
            >
               Export PDF
            </ExportPdfButton>
         </Stack>
      </Stack>
   )
}

export default LivestreamSearchNav
