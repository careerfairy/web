import useGroupATSSyncStatus from "../../../../custom-hook/useGroupATSSyncStatus"
import { useCallback, useState } from "react"
import GenericDialog from "../../../common/GenericDialog"
import {
   Button,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
} from "@mui/material"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import Paper from "@mui/material/Paper"

const SyncStatusButtonDialog = ({ groupId, integrationId }) => {
   const [isOpen, setOpen] = useState(false)

   const onClose = useCallback(() => {
      setOpen(false)
   }, [])

   const openDialog = useCallback(() => {
      setOpen(true)
   }, [])

   return (
      <>
         <Button variant={"contained"} onClick={openDialog} size={"small"}>
            Sync Status
         </Button>
         {isOpen && (
            <GenericDialog title={"Sync Status"} onClose={onClose}>
               <SuspenseWithBoundary>
                  <DialogBody groupId={groupId} integrationId={integrationId} />
               </SuspenseWithBoundary>
            </GenericDialog>
         )}
      </>
   )
}

const DialogBody = ({ groupId, integrationId }) => {
   const { data: syncStatus } = useGroupATSSyncStatus(groupId, integrationId)

   return (
      <TableContainer component={Paper}>
         <Table aria-label="simple table">
            <TableHead>
               <TableRow>
                  <TableCell>Model</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Sync</TableCell>
                  <TableCell>Next Sync</TableCell>
                  <TableCell>Is Initial Sync</TableCell>
               </TableRow>
            </TableHead>
            <TableBody>
               {syncStatus.map((modelStatus) => (
                  <TableRow key={modelStatus.id}>
                     <TableCell>{modelStatus.model}</TableCell>
                     <TableCell>{modelStatus.status}</TableCell>
                     <TableCell>
                        {modelStatus.lastSync?.toLocaleDateString()}
                     </TableCell>
                     <TableCell>
                        {modelStatus.nextSync?.toLocaleDateString()}
                     </TableCell>
                     <TableCell>{modelStatus.isInitialSync}</TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </TableContainer>
   )
}

export default SyncStatusButtonDialog
