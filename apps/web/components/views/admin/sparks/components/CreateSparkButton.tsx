import { Button, ButtonProps } from "@mui/material"
import { FC, useCallback } from "react"
import { useDispatch } from "react-redux"
import { openSparkDialog } from "store/reducers/adminSparksReducer"
import { combineStyles, sxStyles } from "types/commonTypes"
import { useGroup } from "layouts/GroupDashboardLayout"
import useGroupPlanIsValid from "components/custom-hook/group/useGroupPlanIsValid"

const styles = sxStyles({
   root: {
      textTransform: "none",
   },
})

const CreateSparkButton: FC<ButtonProps> = ({ sx, children, ...props }) => {
   const dispatch = useDispatch()
   const group = useGroup()
   const planStatus = useGroupPlanIsValid(group.group.groupId, [
      "trial",
      "tier1",
   ])

   const handleOpen = useCallback(() => {
      dispatch(openSparkDialog(null))
   }, [dispatch])

   return (
      <Button
         disabled={!planStatus.valid}
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
