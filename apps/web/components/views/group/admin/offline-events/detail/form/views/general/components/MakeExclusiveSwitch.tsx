import InfoIcon from "@mui/icons-material/InfoOutlined"
import { Box, FormControlLabel, Typography } from "@mui/material"
import { FormBrandedSwitch } from "components/views/common/inputs/BrandedSwitch"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { sxStyles } from "types/commonTypes"
import { useOfflineEventFormValues } from "../../../useOfflineEventFormValues"

const styles = sxStyles({
   makeExclusiveSwitch: {
      height: "100%",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginX: 0,
      display: {
         xs: "flex",
      },
      flexDirection: {
         xs: "row-reverse",
         md: "column",
      },
      marginTop: {
         xs: 1.5,
         md: "initial",
      },
   },
   makeExclusiveLabel: {
      display: "flex",
      gap: 1,
      userSelect: "none",
   },
})

const MakeExclusiveSwitch = () => {
   const {
      values: { general },
   } = useOfflineEventFormValues()

   return (
      <Box>
         <FormControlLabel
            sx={styles.makeExclusiveSwitch}
            control={
               <FormBrandedSwitch
                  name="general.hidden"
                  value={general.hidden}
                  checked={general.hidden}
               />
            }
            label={
               <Box sx={styles.makeExclusiveLabel}>
                  <Typography>Make Exclusive</Typography>
                  <BrandedTooltip
                     title={
                        "By enabling this you are making this offline event only visible to your career center admins"
                     }
                     onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                     }}
                  >
                     <InfoIcon color="secondary" />
                  </BrandedTooltip>
               </Box>
            }
            labelPlacement="bottom"
         />
      </Box>
   )
}

export default MakeExclusiveSwitch
