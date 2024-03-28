import { sxStyles } from "types/commonTypes"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import { Box, FormControlLabel, Typography } from "@mui/material"
import BrandedTooltip from "components/views/common/tooltips/BrandedTooltip"
import { FormBrandedSwitch } from "components/views/common/inputs/BrandedSwitch"

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

const MakeExclusiveSwitchLabel = () => {
   return (
      <Box sx={styles.makeExclusiveLabel}>
         <Typography>Make Exclusive</Typography>
         <BrandedTooltip
            title={
               "By enabling this you are making this stream only visible to hosts"
            }
            onClick={(event) => {
               event.preventDefault()
               event.stopPropagation()
            }}
         >
            <InfoIcon color="secondary" />
         </BrandedTooltip>
      </Box>
   )
}

const MakeExclusiveSwitch = () => {
   return (
      <Box>
         <FormControlLabel
            sx={styles.makeExclusiveSwitch}
            control={<FormBrandedSwitch name="general.hidden" />}
            label={<MakeExclusiveSwitchLabel />}
            labelPlacement="bottom"
         />
      </Box>
   )
}

export default MakeExclusiveSwitch
