import { CityOption } from "@careerfairy/shared-lib/countries/types"
import { FormHelperText } from "@mui/material"
import useCityById from "components/custom-hook/countries/useCityById"
import { CityAutoComplete } from "components/views/countries/CityAutoComplete"
import { userRepo } from "data/RepositoryInstances"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback, useEffect, useState } from "react"

export const UserCitySelector = () => {
   const { userData } = useAuth()
   const [hasFocused, setHasFocused] = useState<boolean>(false)
   const [userCountryCode, setUserCountryCode] = useState<string | null>(
      userData.countryIsoCode
   )
   const { data: userCityOption, isLoading } = useCityById(
      userData.cityIsoCode,
      false
   )

   const handleSelectedCityChange = useCallback(
      async (city: CityOption | null) => {
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
      <>
         <CityAutoComplete
            value={userCityOption}
            disabled={!userData.countryIsoCode}
            loading={isLoading}
            countryId={userData.countryIsoCode}
            onFocus={() => setHasFocused(true)}
            handleSelectedCityChange={handleSelectedCityChange}
         />
         {userData.countryIsoCode &&
         !isLoading &&
         !userCityOption &&
         hasFocused ? (
            <FormHelperText sx={{ color: "error.main", ml: 2 }}>
               Please select the city you are currently located in.
            </FormHelperText>
         ) : null}
      </>
   )
}
