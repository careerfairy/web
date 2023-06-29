import useGroupATSSyncStatus from "../../../../custom-hook/useGroupATSSyncStatus"
import Paper from "@mui/material/Paper"
import {
   Alert,
   AlertTitle,
   CircularProgress,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Tooltip,
} from "@mui/material"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import IconButton from "@mui/material/IconButton"
import { SWRConfiguration } from "swr"
import { SyncStatus } from "@careerfairy/shared-lib/ats/SyncStatus"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useEffect, useMemo } from "react"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import { timeAgo } from "../../../../helperFunctions/HelperFunctions"
import { atsServiceInstance } from "../../../../../data/firebase/ATSService"
import { useATSAccount } from "./ATSAccountContextProvider"

const WaitForFirstSyncStatus = () => {
   const { atsAccount } = useATSAccount()
   const { errorNotification } = useSnackbarNotifications()

   // fetched every 3s
   const { data: syncStatus } = useGroupATSSyncStatus(
      atsAccount.groupId,
      atsAccount.id,
      syncStatusRemoteCallsOptions
   )

   /**
    * Show the loading models first
    */
   const sortedSyncStatus = useMemo(() => {
      return [...syncStatus].sort((a, b) =>
         b.status === "DONE" || b.status === "PARTIALLY_SYNCED" ? -1 : 0
      )
   }, [syncStatus])

   // mark the first sync complete
   useEffect(() => {
      if (isFirstSyncComplete(syncStatus)) {
         atsServiceInstance
            .setFirstSyncComplete(atsAccount.groupId, atsAccount.id)
            .catch((e) => {
               errorNotification(e, "Failed to set first sync as complete")
            })
      }
   }, [atsAccount.groupId, atsAccount.id, errorNotification, syncStatus])

   return (
      <Box p={3}>
         <Card>
            <Box>
               <Alert
                  sx={{ display: "flex", alignItems: "center" }}
                  severity="warning"
                  icon={<CircularProgress color="warning" size={30} />}
               >
                  <AlertTitle>First Synchronization In Progress</AlertTitle>
                  Depending on the amount of data we need to fetch, this process
                  may take a couple minutes.
               </Alert>
            </Box>
            <Box>
               <TableContainer component={Paper}>
                  <Table aria-label="simple table">
                     <TableHead>
                        <TableRow>
                           <TableCell>
                              Entity Model{" "}
                              <Tooltip title="Type of entities we need to fetch.">
                                 <IconButton>
                                    <InfoOutlinedIcon fontSize="small" />
                                 </IconButton>
                              </Tooltip>
                           </TableCell>
                           <TableCell align="center">Status</TableCell>
                           <TableCell>Next Sync</TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {sortedSyncStatus.map((modelStatus) => (
                           <SyncStatusRow
                              key={modelStatus.id}
                              data={modelStatus}
                           />
                        ))}
                     </TableBody>
                  </Table>
               </TableContainer>
            </Box>
         </Card>
      </Box>
   )
}

const SyncStatusRow = ({ data }: { data: SyncStatus }) => {
   let status
   switch (data.status) {
      case "DONE":
         status = <CheckCircleIcon color="success" />
         break
      case "PARTIALLY_SYNCED":
         status = (
            <Tooltip title="Some entities failed to sync.">
               <CheckCircleIcon color="warning" />
            </Tooltip>
         )
         break
      case "SYNCING":
         status = <CircularProgress size={20} disableShrink />
         break
      default:
         status = data.status
   }

   const nextSync = !data.nextSync
      ? "Manual Sync since it's a test account."
      : timeAgo(data.nextSync)

   return (
      <TableRow>
         <TableCell>{data.model}</TableCell>
         <TableCell align="center">{status}</TableCell>
         <TableCell>{nextSync}</TableCell>
      </TableRow>
   )
}

/**
 * Check if all models are ready
 *
 * If we don't find any still "SYNCING", we should be done
 * PAUSED, FAILED, DISABLED shouldn't be handled here
 * @param entitiesStatus
 */
const isFirstSyncComplete = (entitiesStatus: SyncStatus[]) => {
   const waitForEntities = ["Department", "Job", "Office", "RemoteUser", "Tag"]
   const incomplete = entitiesStatus
      .filter((s) => waitForEntities.includes(s.model))
      .filter((model) => model.isInitialSync && model.status === "SYNCING")

   // only complete if we don't have any still syncing
   return incomplete.length === 0
}

const syncStatusRemoteCallsOptions: SWRConfiguration = {
   suspense: true,
   // fetch new updates every 3s
   refreshInterval: 3000,
   // allow revalidation events
   revalidateIfStale: true,
   revalidateOnFocus: true,
   revalidateOnMount: true,
   revalidateOnReconnect: true,

   loadingTimeout: 5000,
}

export default WaitForFirstSyncStatus
