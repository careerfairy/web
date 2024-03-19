import { Button, Stack } from "@mui/material"
import { useLivestreamCreationContext } from "components/views/group/admin/events/detail/LivestreamCreationContext"
import InvalidAlertTooltip from "components/views/group/admin/events/detail/form/InvalidAlertTooltip"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   button: {
      textTransform: "none",
      fontWeight: "700",
   },
})

export const LivestreamButtonActions = () => {
   const { shouldShowAlertIndicator } = useLivestreamCreationContext()

   return (
      <Stack direction="row" spacing={3} alignItems="center">
         <Button variant="outlined" color="secondary" sx={styles.button}>
            Save & Update
         </Button>

         <Button variant="contained" disabled sx={styles.button}>
            Publish
         </Button>

         {Boolean(shouldShowAlertIndicator) && <InvalidAlertTooltip />}
      </Stack>
   )
}
