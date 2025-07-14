import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { Button, ButtonProps } from "@mui/material"
import useGroupPlanIsValid from "components/custom-hook/group/useGroupPlanIsValid"
import useGroupSparks from "components/custom-hook/spark/useGroupSparks"
import { useAppDispatch } from "components/custom-hook/store"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC, useCallback } from "react"
import { openSparkDialog } from "store/reducers/adminSparksReducer"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      textTransform: "none",
   },
})

const CreateSparkButton: FC<ButtonProps> = ({ sx, children, ...props }) => {
   const dispatch = useAppDispatch()
   const { group, groupPresenter } = useGroup()

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
   const handleOpen = useCallback(() => {
      dispatch(openSparkDialog())
   }, [dispatch])

   return (
      <Button
         disabled={disableUploadSparks}
         onClick={handleOpen}
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
