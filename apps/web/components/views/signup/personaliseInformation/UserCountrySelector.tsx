import { CountryOption } from "@careerfairy/shared-lib/countries/types"
import { useAuth } from "HOCs/AuthProvider"
import { CountryAutoComplete } from "components/views/countries/CountryAutoComplete"
import { userRepo } from "data/RepositoryInstances"

export const UserCountrySelector = () => {
   const { userData } = useAuth()

   const handleSelectedCountryChange = async (
      country: CountryOption | null
   ) => {
      await userRepo.updateUserData(userData.id, {
         countryIsoCode: country?.id ?? null,
         cityIsoCode: null,
         stateIsoCode: null,
      })
   }

   return (
      <CountryAutoComplete
         countryValueId={userData.countryIsoCode}
         handleSelectedCountryChange={handleSelectedCountryChange}
      />
   )
}
