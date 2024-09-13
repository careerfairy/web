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
   notEditable?: boolean
}
const JobMenu: FC<Props> = ({ jobId, notEditable }) => {
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
         handleEdit={notEditable ? null : handleEditJob}
         handleRemove={handleRemoveJob}
      />
   )
}

export default JobMenu
