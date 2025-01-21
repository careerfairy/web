import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { CityOption } from "@careerfairy/shared-lib/countries/types"
import { FormHelperText } from "@mui/material"
import useCityById from "components/custom-hook/countries/useCityById"
import { CityAutoComplete } from "components/views/countries/CityAutoComplete"
import { userRepo } from "data/RepositoryInstances"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback, useEffect, useState } from "react"

export const UserCitySelector = () => {
   const { userData } = useAuth()

   const [userCountryCode, setUserCountryCode] = useState<string | null>(
      userData.countryIsoCode
   )
   const { data: userCityOption, isLoading } = useCityById(
      userData.cityIsoCode,
      false
   )
   const [city, setCity] = useState<OptionGroup | null>(userCityOption ?? null)

   const handleSelectedCityChange = useCallback(
      async (city: CityOption | null) => {
         setCity(city ? (city as OptionGroup) : null)
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

   useEffect(() => {
      if (userData.cityIsoCode && Boolean(userCityOption)) {
         setCity(userCityOption)
      } else {
         setCity(null)
      }
   }, [userData.cityIsoCode, userCityOption])

   return (
      <>
         <CityAutoComplete
            value={city}
            disabled={!userData.countryIsoCode}
            loading={isLoading}
            countryId={userData.countryIsoCode}
            handleSelectedCityChange={handleSelectedCityChange}
         />
         {userData.countryIsoCode && !isLoading && !city ? (
            <FormHelperText sx={{ color: "error.main", ml: 2 }}>
               Please select the city you are currently located in.
            </FormHelperText>
         ) : null}
      </>
   )
}
