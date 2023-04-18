import { FC } from "react"
import { Dialog, Slide } from "@mui/material"
import useGroupLivestreamStat from "../../../../../custom-hook/live-stream/useGroupLivestreamStat"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import { useFeedbackPageContext } from "./FeedbackPageProvider"

type Props = {
   livestreamId: string
}

const FeedbackDialog: FC<Props> = ({ livestreamId }) => {
   const { handleCloseFeedbackDialog } = useFeedbackPageContext()
   const { group } = useGroup()

   const { data: stats } = useGroupLivestreamStat(group.id, livestreamId)

   const livestreamStats = stats?.[0]

   return (
      <Dialog
         open={Boolean(livestreamStats)}
         onClose={handleCloseFeedbackDialog}
         TransitionComponent={Slide}
      >
         FeedbackDialog
      </Dialog>
   )
}

export default FeedbackDialog
