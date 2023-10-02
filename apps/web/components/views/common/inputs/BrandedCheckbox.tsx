import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { Box, Checkbox } from "@mui/material"
import { RadioProps } from "@mui/material/Radio"
import { styled } from "@mui/material/styles"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   checkboxIconWrapper: {
      width: 24,
      height: 24,
      borderRadius: "4px",
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

export type BrandedCheckboxProps = Omit<RadioProps, "variant">

const BrandedCheckbox = styled((props: BrandedCheckboxProps) => (
   <Checkbox
      color={"default"}
      icon={<Box sx={styles.checkboxIconWrapper} />}
      checkedIcon={
         <Box sx={styles.checkboxIconWrapper}>
            <CheckRoundedIcon sx={styles.dotIcon} fontSize={"small"} />
         </Box>
      }
      {...props}
   />
))(({ theme }) => ({
   color: theme.palette.mode === "dark" ? undefined : "black !important",
}))

export default BrandedCheckbox
