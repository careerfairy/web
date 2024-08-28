import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { ResponsiveSelectWithDrawer } from "../components/ResponsiveSelectWithDrawer"

const styles = sxStyles({
   titleContainer: {
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: "30px",
      letterSpacing: "0em",
      textAlign: "left",
      marginBottom: "21px",
      display: "flex",
      flexDirection: {
         xs: "column",
         md: "row",
      },
      alignItems: {
         xs: "flex-start",
         md: "center",
      },
   },
   select: {
      width: "100%",
      color: "#6749EA",
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: "30px",
      letterSpacing: "0em",
      ".MuiSelect-select:first-letter": {
         textTransform: "lowercase",
      },
   },
   selectMenu: {
      marginTop: 4,
      marginLeft: "-3px",
      ".MuiPaper-root": {
         minWidth: "0 !important",
      },
   },
   selectContainer: {
      "& .MuiSelect-select": {
         paddingLeft: "0 !important",
         paddingTop: "0 !important",
         paddingBottom: "0 !important",
      },
      "& fieldset": {
         "&.MuiOutlinedInput-notchedOutline": {
            border: "0 !important",
         },
      },
   },
})

export type TitleWithSelectOption = {
   value: string
   label: string
}

type TitleWithSelectProps = {
   title: string
   selectedOption: string
   setSelectedOption: React.Dispatch<React.SetStateAction<string>>
   options: TitleWithSelectOption[]
}

export const TitleWithSelect = ({
   title,
   selectedOption,
   setSelectedOption,
   options,
}: TitleWithSelectProps) => {
   return (
      <Box sx={styles.titleContainer}>
         {title}
         <ResponsiveSelectWithDrawer
            selectValue={selectedOption}
            setSelectValue={setSelectedOption}
            options={options}
            selectProps={{
               sx: styles.select,
            }}
            selectMenuProps={{
               anchorOrigin: {
                  vertical: "top",
                  horizontal: "left",
               },
               transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
               },
               sx: styles.selectMenu,
            }}
            selectContainerProps={{ sx: styles.selectContainer }}
         />
      </Box>
   )
}
