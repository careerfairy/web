import { CountryOption } from "@careerfairy/shared-lib/countries/types"
import { FormHelperText } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { CountryAutoComplete } from "components/views/countries/CountryAutoComplete"
import { userRepo } from "data/RepositoryInstances"
import { useState } from "react"

export const UserCountrySelector = () => {
   const { userData } = useAuth()
   const [hasFocused, setHasFocused] = useState<boolean>(false)

   const handleSelectedCountryChange = async (
      country: CountryOption | null
   ) => {
      await userRepo.updateUserData(userData.id, {
         countryIsoCode: country?.id ?? null,
         stateName: null,
         stateIsoCode: null,
      })
   }

   return (
      <>
         <CountryAutoComplete
            countryValueId={userData.countryIsoCode}
            handleSelectedCountryChange={handleSelectedCountryChange}
            onFocus={() => setHasFocused(true)}
         />
         {!userData.countryIsoCode && hasFocused ? (
            <FormHelperText sx={{ color: "error.main", ml: 2 }}>
               Please select the country you are currently located in.
            </FormHelperText>
         ) : null}
      </>
   )
}
