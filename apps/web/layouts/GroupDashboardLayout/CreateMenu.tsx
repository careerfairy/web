import { CircularProgress } from "@mui/material"
import { JOB_DIALOG_QUERY_KEYS } from "components/custom-hook/custom-job/useJobDialogRouter"
import { SPARKS_DIALOG_QUERY_KEYS } from "components/views/admin/sparks/sparks-dialog/hooks/useSparksDialogRouter"
import { useHasAccessToSparks } from "components/views/admin/sparks/useHasAccesToSparks"
import { useLivestreamRouting } from "components/views/group/admin/events/useLivestreamRouting"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { JobsIcon } from "../../components/views/common/icons/JobsIcon"
import { LiveStreamsIcon } from "../../components/views/common/icons/LiveStreamsIcon"
import { SparksIcon } from "../../components/views/common/icons/SparksIcon"
import BrandedResponsiveMenu, {
   MenuOption,
} from "../../components/views/common/inputs/BrandedResponsiveMenu"

type CreateMenuProps = {
   open: boolean
   anchorEl: HTMLElement | null
   handleClose: () => void
   isMobileOverride?: boolean
}

export const CreateMenu = ({
   open,
   anchorEl,
   handleClose,
   isMobileOverride = false,
}: CreateMenuProps) => {
   const { createDraftLivestream, isCreating } = useLivestreamRouting()
   const router = useRouter()
   const hasAccessToSparks = useHasAccessToSparks()
   const groupId = router.query.groupId as string

   const createMenuOptions = useMemo<MenuOption[]>(
      () => [
         {
            label: "Live stream",
            icon: isCreating ? (
               <CircularProgress size={16} />
            ) : (
               <LiveStreamsIcon />
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
                  router.push(
                     `/group/${groupId}/admin/content/sparks?${SPARKS_DIALOG_QUERY_KEYS.sparksDialog}=true`
                  )
               } else {
                  // still get taken to the sparks content page and be prompted to upgrade/trial
                  router.push(`/group/${groupId}/admin/content/sparks`)
               }
               handleClose()
            },
         },
         {
            label: "Job opening",
            icon: <JobsIcon />,
            handleClick: () => {
               router.push(
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
         router,
         groupId,
      ]
   )

   return (
      <BrandedResponsiveMenu
         options={createMenuOptions}
         open={open}
         anchorEl={anchorEl}
         handleClose={handleClose}
         isMobileOverride={isMobileOverride}
      />
   )
}
