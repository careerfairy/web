import React, { useCallback, useMemo } from "react"
import { Box, Card } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import LivestreamSearch, {
   LivestreamHit,
} from "../../../common/LivestreamSearch"
import Stack from "@mui/material/Stack"
import UserTypeTabs from "./UserTypeTabs"
import ExportPdfButton from "../../../common/ExportPDFButton"
import { useLivestreamsAnalyticsPageContext } from "../LivestreamAnalyticsPageProvider"
import { useRouter } from "next/router"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { Search as FindIcon } from "react-feather"
import { where } from "firebase/firestore"

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

   const handleChange = useCallback(
      (newValue: LivestreamHit | null) => {
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

   const additionalConstraints = useMemo(
      () => (group?.id ? [where("groupIds", "array-contains", group.id)] : []),
      [group?.id]
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
                  handleChange={handleChange}
                  value={currentStreamStats?.livestream ?? null}
                  startIcon={<FindIcon color={"black"} />}
                  additionalConstraints={additionalConstraints}
               />
            </Card>
         </Box>
         <Stack minHeight={53} height="100%" direction="row" spacing={2}>
            <UserTypeTabs />
            <ExportPdfButton
               livestreamId={currentStreamStats?.livestream?.id}
               groupId={group.id}
            >
               Export PDF
            </ExportPdfButton>
         </Stack>
      </Stack>
   )
}

export default LivestreamSearchNav
