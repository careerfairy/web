import DotIcon from "@mui/icons-material/FiberManualRecord"
import { Box } from "@mui/material"
import Radio, { RadioProps } from "@mui/material/Radio"
import { styled } from "@mui/material/styles"
import { sxStyles } from "types/commonTypes"
export type BrandedRadioProps = Omit<RadioProps, "variant">

const BrandedRadio = styled((props: BrandedRadioProps) => (
   <Radio
      color={"default"}
      icon={<Box sx={styles.checkboxIconWrapper} />}
      checkedIcon={
         <Box sx={styles.checkboxIconWrapper}>
            <DotIcon sx={styles.dotIcon} fontSize={"small"} />
         </Box>
      }
      {...props}
   />
))(({ theme }) => ({
   color: theme.palette.mode === "dark" ? undefined : "black !important",
}))

const styles = sxStyles({
   checkboxIconWrapper: {
      width: 24,
      height: 24,
      borderRadius: "50%",
      bgcolor: "tertiary.main",
      color: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   dotIcon: {
      width: 18,
      height: 18,
      color: "black",
   },
})

export default BrandedRadio
