import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { Box, ButtonBase, Checkbox, Stack, Typography } from "@mui/material"
import { RadioProps } from "@mui/material/Radio"
import { SxProps, styled } from "@mui/material/styles"
import { combineStyles, sxStyles } from "types/commonTypes"

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
      p: "16px",
   },
   checkBoxBtnBase: {
      height: "56px",
      fontFamily: "inherit",
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
   },
})

export type BrandedCheckboxProps = Omit<RadioProps, "variant">

export const BrandedCheckbox = styled((props: BrandedCheckboxProps) => (
   <Checkbox
      color={"default"}
      icon={<Box sx={styles.checkboxIconWrapper} />}
      checkedIcon={
         <Box
            sx={[
               styles.checkboxIconWrapper,
               {
                  bgcolor: (theme) => theme.brand.purple[50],
               },
            ]}
         >
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
   wrapperSx?: SxProps
}

export const BrandedCheckboxListItem = ({
   value,
   checked,
   handleClick,
   wrapperSx,
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
         <Stack
            direction={"row"}
            sx={combineStyles(styles.checkBoxWrapper, wrapperSx)}
         >
            <Typography variant="medium" sx={styles.tagName}>
               {value.name}
            </Typography>
            <BrandedCheckbox checked={checked} sx={{ p: 0 }} />
         </Stack>
      </ButtonBase>
   )
}
