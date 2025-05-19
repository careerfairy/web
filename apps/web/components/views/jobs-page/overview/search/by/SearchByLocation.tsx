import { dropdownValueMapper } from "components/custom-hook/countries/useLocationSearch"

import { useMemo } from "react"

import { useLocationSearch } from "components/custom-hook/countries/useLocationSearch"

import useIsMobile from "components/custom-hook/useIsMobile"

import { ChipDropdown } from "components/views/common/ChipDrodown"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"
import { useState } from "react"
import { sxStyles } from "types/commonTypes"

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
      width: "26px",
      height: "26px",
      color: (theme) => theme.brand.white[50],
      fill: (theme) => theme.brand.black[700],
      "&:hover": {
         fill: (theme) => theme.brand.black[800],
         cursor: "pointer",
      },
   },
})
export const SearchByLocation = () => {
   const { searchLocations, setSearchLocations } = useJobsOverviewContext()
   console.log("🚀 ~ SearchByLocation ~ searchLocations:", searchLocations)
   const [locationSearchValue, setLocationSearchValue] = useState("")

   const isMobile = useIsMobile()

   const { data: locations, isLoading } = useLocationSearch(
      locationSearchValue,
      {
         suspense: false,
         initialLocationIds: searchLocations,
      }
   )
   console.log("🚀 ~ SearchByLocation ~ isLoading:", isLoading)

   console.log("🚀 ~ SearchByLocation ~ locations:", locations)

   const locationOptions = useMemo(() => {
      return locations?.map(dropdownValueMapper) ?? []
   }, [locations])

   return (
      <ChipDropdown
         isDialog={isMobile}
         label="Location"
         options={locationOptions}
         handleValueChange={setSearchLocations}
         selectedOptions={searchLocations}
         search={
            <BrandedTextField
               fullWidth
               placeholder="Search city, state, canton or country"
               sx={styles.searchField}
               value={locationSearchValue}
               onChange={(e) => setLocationSearchValue(e.target.value)}
            />
         }
      />
   )
}
