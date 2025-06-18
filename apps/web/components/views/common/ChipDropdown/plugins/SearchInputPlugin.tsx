import { Box } from "@mui/material"
import { SearchInputPluginProps } from "components/views/common/ChipDropdown/ChipDropdown"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { sxStyles } from "types/commonTypes"
import { XCircleIcon } from "../../icons/XCircleIcon"

const styles = sxStyles({
   searchField: {
      "& .MuiInputBase-root": {
         p: "4px 12px",
         height: "48px",
         borderRadius: "12px",
         border: (theme) => `1px solid ${theme.palette.neutral[50]}`,

         background: (theme) => theme.brand.white[100],
      },
      "& .MuiInputBase-input": {
         ml: "8px",
         p: "0px",
         "&::placeholder": {
            color: (theme) => theme.palette.neutral[600],
            fontSize: "14px",
            fontWeight: "400",
         },
      },
      "& .MuiFilledInput-input": {
         color: (theme) => theme.palette.neutral[800],
         fontSize: "14px",
         fontWeight: "400",
      },
   },
   clearIcon: {
      width: "24px",
      height: "24px",
      "&:hover": {
         cursor: "pointer",
      },
   },
})

export const SearchInputPlugin = ({
   searchValue,
   setSearchValue,
   searchInputRef,
   placeholder,
}: SearchInputPluginProps) => {
   return (
      <BrandedTextField
         fullWidth
         placeholder={placeholder}
         sx={styles.searchField}
         value={searchValue}
         onChange={(e) => setSearchValue(e.target.value)}
         autoFocus
         inputRef={searchInputRef}
         InputProps={{
            endAdornment: searchValue?.length ? (
               <Box
                  sx={styles.clearIcon}
                  component={XCircleIcon}
                  onClick={() => setSearchValue("")}
               />
            ) : null,
         }}
      />
   )
}
