import { getLocationIds } from "@careerfairy/shared-lib/countries/types"
import { Country, State } from "country-state-city"

export const getLocationById = (locationId: string) => {
   const { countryIsoCode, stateIsoCode } = getLocationIds(locationId)

   if (!countryIsoCode) return null

   const country = Country.getCountryByCode(countryIsoCode)

   if (!country) return null

   if (stateIsoCode) {
      const state = State.getStateByCodeAndCountry(stateIsoCode, countryIsoCode)

      if (state) {
         return {
            id: locationId,
            name: `${state.name} (${country.name})`,
         }
      }
   }

   if (country) {
      return {
         id: locationId,
         name: country.name,
      }
   }

   return null
}
