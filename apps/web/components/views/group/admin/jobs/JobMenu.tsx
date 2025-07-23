import { FC, MouseEvent, useCallback } from "react"
import { useJobDialogRouter } from "../../../../custom-hook/custom-job/useJobDialogRouter"
import useMenuState from "../../../../custom-hook/useMenuState"
import MoreMenuWithEditAndRemoveOptions from "../events/detail/form/views/questions/components/MoreMenu"

type Props = {
   jobId: string
   editable?: boolean
}
const JobMenu: FC<Props> = ({ jobId, editable = true }) => {
   const { handleClose } = useMenuState()
   const { openJobDialog, openDeleteJobDialog } = useJobDialogRouter()

   const handleRemoveJob = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         openDeleteJobDialog(jobId)
         handleClose()
      },
      [openDeleteJobDialog, handleClose, jobId]
   )

   const handleEditJob = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         openJobDialog(jobId)
         handleClose()
      },
      [openJobDialog, handleClose, jobId]
   )
   return (
      <MoreMenuWithEditAndRemoveOptions
         labels={["Edit job opening details", "Delete job opening"]}
         handleEdit={editable ? handleEditJob : null}
         handleRemove={handleRemoveJob}
      />
   )
}

export default JobMenu
