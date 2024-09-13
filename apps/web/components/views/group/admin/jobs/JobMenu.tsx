import { FC, MouseEvent, useCallback } from "react"
import { useDispatch } from "react-redux"
import {
   openDeleteJobDialogOpen,
   openJobsDialog,
} from "../../../../../store/reducers/adminJobsReducer"
import useMenuState from "../../../../custom-hook/useMenuState"
import MoreMenuWithEditAndRemoveOptions from "../events/detail/form/views/questions/components/MoreMenu"

type Props = {
   jobId: string
   editable?: boolean
}
const JobMenu: FC<Props> = ({ jobId, editable = true }) => {
   const { handleClose } = useMenuState()
   const dispatch = useDispatch()

   const handleRemoveJob = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         dispatch(openDeleteJobDialogOpen(jobId))
         handleClose()
      },
      [dispatch, handleClose, jobId]
   )

   const handleEditJob = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         dispatch(openJobsDialog(jobId))
         handleClose()
      },
      [dispatch, handleClose, jobId]
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
