import { SearchInputPluginProps } from "components/views/common/ChipDropdown/ChipDropdown"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   searchField: {
      // position: "sticky",
      // top: "0px",

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
         // autoFocus
         inputRef={searchInputRef}
         // inputRef={(input) => input?.focus()}
         InputProps={{
            // inputRef: inputRef,
            autoFocus: true,
         }}
         onFocus={() => {
            // alert("focus")
         }}
         // onClick={() => {
         //    alert("click")
         // }}
         // autoFocus
      />
   )
}
