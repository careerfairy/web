import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { Box, ButtonBase, Checkbox, Stack, Typography } from "@mui/material"
import { RadioProps } from "@mui/material/Radio"
import { styled } from "@mui/material/styles"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   checkboxIconWrapper: {
      width: 24,
      height: 24,
      borderRadius: "4px",
      bgcolor: (theme) => theme.brand.black[400],
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
   checkBoxWrapper: {
      alignItems: "center",
      width: "100%",
      justifyContent: "space-between",
      p: "16px 24px",
   },
   checkBoxBtnBase: {
      height: "56px",
      fontFamily: "inherit",
      mx: {
         xs: "-23px !important",
         sm: "-23px !important",
         md: "-24px !important",
      },
      "&:hover": {
         backgroundColor: (theme) => theme.brand.black[100],
         "& .MuiBox-root": {
            backgroundColor: (theme) => theme.palette.neutral[100],
         },
      },
   },
   checkedCheckboxBtnBase: {
      backgroundColor: (theme) => theme.brand.white[300],
      ":hover": {
         backgroundColor: (theme) => theme.brand.white[400],
         "& .MuiBox-root": {
            backgroundColor: (theme) => theme.brand.purple[50],
         },
      },
   },
   tagName: {
      color: (theme) => theme.palette.neutral[800],
      fontWeight: 400,
      pl: {
         xs: "12px",
         sm: "12px",
         md: 0,
      },
   },
})

export type BrandedCheckboxProps = Omit<RadioProps, "variant">

export const BrandedCheckbox = styled((props: BrandedCheckboxProps) => (
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

type BrandedCheckboxListItemProps = {
   value: { id: string; name: string }
   checked: boolean
   handleClick: (id: string) => void
}

export const BrandedCheckboxListItem = ({
   value,
   checked,
   handleClick,
}: BrandedCheckboxListItemProps) => {
   return (
      <ButtonBase
         onClick={() => handleClick(value.id)}
         sx={[
            styles.checkBoxBtnBase,
            checked ? styles.checkedCheckboxBtnBase : null,
         ]}
         disableRipple
      >
         <Stack direction={"row"} sx={styles.checkBoxWrapper}>
            <Typography variant="medium" sx={styles.tagName}>
               {value.name}
            </Typography>
            <BrandedCheckbox checked={checked} />
         </Stack>
      </ButtonBase>
   )
}
