import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { CityOption } from "@careerfairy/shared-lib/countries/types"
import { Skeleton } from "@mui/material"
import useCityById from "components/custom-hook/countries/useCityById"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { CityAutoComplete } from "components/views/countries/CityAutocomplete"
import { userRepo } from "data/RepositoryInstances"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback, useEffect, useState } from "react"

export const UserCitySelector = () => {
   return (
      <SuspenseWithBoundary
         fallback={
            <Skeleton
               variant="rectangular"
               height={50}
               sx={{ borderRadius: "8px" }}
            />
         }
      >
         <UserCityDropdown />
      </SuspenseWithBoundary>
   )
}

const UserCityDropdown = () => {
   const { userData } = useAuth()

   const [userCountryCode, setUserCountryCode] = useState<string | null>(
      userData.countryIsoCode
   )
   const { data: userCityOption } = useCityById(userData.cityIsoCode)
   const [city, setCity] = useState<OptionGroup | null>(userCityOption)

   const handleSelectedCityChange = useCallback(
      async (city: CityOption | null) => {
         setCity(city as OptionGroup)
         await userRepo.updateUserData(userData.id, {
            cityIsoCode: city?.id ?? null,
            stateIsoCode: city?.stateIsoCode ?? null,
         })
      },
      [userData.id]
   )

   useEffect(() => {
      if (userData.countryIsoCode !== userCountryCode) {
         setUserCountryCode(userData.countryIsoCode)
         handleSelectedCityChange(null)
      }
   }, [userData.countryIsoCode, userCountryCode, handleSelectedCityChange])

   return (
      <CityAutoComplete
         value={city}
         disabled={!userData.countryIsoCode}
         countryId={userData.countryIsoCode}
         handleSelectedCityChange={handleSelectedCityChange}
      />
   )
}
