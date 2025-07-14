import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { Button, ButtonProps } from "@mui/material"
import useGroupPlanIsValid from "components/custom-hook/group/useGroupPlanIsValid"
import useGroupSparks from "components/custom-hook/spark/useGroupSparks"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"
import { useSparksDialogRouter } from "../sparks-dialog/hooks/useSparksDialogRouter"

const styles = sxStyles({
   root: {
      textTransform: "none",
   },
})

const CreateSparkButton: FC<ButtonProps> = ({ sx, children, ...props }) => {
   const { group, groupPresenter } = useGroup()
   const { openDialog } = useSparksDialogRouter()

   const maxPublicSparks = groupPresenter.getMaxPublicSparks()

   const { data: publicSparks } = useGroupSparks(group.groupId, {
      isPublished: true,
      limit: maxPublicSparks,
   })
   const planStatus = useGroupPlanIsValid(group.groupId, [
      GroupPlanTypes.Trial,
      GroupPlanTypes.Tier1,
      GroupPlanTypes.Tier2,
      GroupPlanTypes.Tier3,
   ])

   const maxSparksReached = groupPresenter.hasReachedMaxSparks(
      publicSparks.length
   )
   const disableUploadSparks = !planStatus.valid || maxSparksReached

   return (
      <Button
         disabled={disableUploadSparks}
         onClick={openDialog}
         color="secondary"
         sx={combineStyles(styles.root, sx)}
         variant="contained"
         {...props}
      >
         {children || "Upload a new Spark"}
      </Button>
   )
}

export default CreateSparkButton
