import { CircularProgress } from "@mui/material"
import { JOB_DIALOG_QUERY_KEYS } from "components/custom-hook/custom-job/useJobDialogRouter"
import { useAppDispatch } from "components/custom-hook/store"
import { useHasAccessToSparks } from "components/views/admin/sparks/useHasAccesToSparks"
import { useLivestreamRouting } from "components/views/group/admin/events/useLivestreamRouting"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { Radio as LiveStreamsIcon } from "react-feather"
import { openSparkDialog } from "store/reducers/adminSparksReducer"
import { JobsIcon } from "../../components/views/common/icons/JobsIcon"
import { SparksIcon } from "../../components/views/common/icons/SparksIcon"
import BrandedResponsiveMenu, {
   type MenuOption,
   type PopoverMenuProps,
} from "../../components/views/common/inputs/BrandedResponsiveMenu"

type CreateMenuProps = {
   open: boolean
   anchorEl: HTMLElement | null
   handleClose: () => void
   isMobileOverride?: boolean
   menuProps?: Pick<PopoverMenuProps, "sx" | "TransitionComponent">
}

export const CreateMenu = ({
   open,
   anchorEl,
   handleClose,
   isMobileOverride = false,
   menuProps,
}: CreateMenuProps) => {
   const { createDraftLivestream, isCreating } = useLivestreamRouting()
   const { query, push } = useRouter()
   const hasAccessToSparks = useHasAccessToSparks()
   const groupId = query.groupId as string
   const dispatch = useAppDispatch()

   const createMenuOptions = useMemo<MenuOption[]>(
      () => [
         {
            label: "Live stream",
            icon: isCreating ? (
               <CircularProgress size={16} />
            ) : (
               <LiveStreamsIcon strokeWidth={1.5} />
            ),
            handleClick: () => {
               if (isCreating) return

               createDraftLivestream()
               handleClose()
            },
         },
         {
            label: "Spark",
            icon: <SparksIcon />,
            handleClick: () => {
               if (hasAccessToSparks) {
                  dispatch(openSparkDialog())
               }
               push(`/group/${groupId}/admin/content/sparks`)
               handleClose()
            },
         },
         {
            label: "Job opening",
            icon: <JobsIcon />,
            handleClick: () => {
               push(
                  `/group/${groupId}/admin/jobs?${JOB_DIALOG_QUERY_KEYS.jobDialog}=true`
               )
               handleClose()
            },
         },
      ],
      [
         isCreating,
         createDraftLivestream,
         handleClose,
         hasAccessToSparks,
         push,
         groupId,
         dispatch,
      ]
   )

   return (
      <BrandedResponsiveMenu
         options={createMenuOptions}
         open={open}
         anchorEl={anchorEl}
         handleClose={handleClose}
         isMobileOverride={isMobileOverride}
         disableSwipeToOpen
         menuProps={menuProps}
      />
   )
}
