import { CityOption } from "@careerfairy/shared-lib/countries/types"
import { FormHelperText } from "@mui/material"
import { CityAutoComplete } from "components/views/countries/CityAutoComplete"
import { userRepo } from "data/RepositoryInstances"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback, useEffect, useMemo, useState } from "react"

export const UserCitySelector = () => {
   const { userData } = useAuth()
   const [hasFocused, setHasFocused] = useState<boolean>(false)
   const [userCountryCode, setUserCountryCode] = useState<string | null>(
      userData.countryIsoCode
   )

   const userCityOption = useMemo(() => {
      return userData.stateName && userData.stateIsoCode
         ? {
              id: userData.stateIsoCode,
              name: userData.stateName,
           }
         : null
   }, [userData.stateName, userData.stateIsoCode])

   const handleSelectedCityChange = useCallback(
      async (state: CityOption | null) => {
         await userRepo.updateUserData(userData.id, {
            stateIsoCode: state?.id ?? null,
            stateName: state?.name ?? null,
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
            countryId={userData.countryIsoCode}
            onFocus={() => setHasFocused(true)}
            handleSelectedCityChange={handleSelectedCityChange}
         />
         {userData.countryIsoCode && !userCityOption && hasFocused ? (
            <FormHelperText sx={{ color: "error.main", ml: 2 }}>
               Please select the city you are currently located in.
            </FormHelperText>
         ) : null}
      </>
   )
}
