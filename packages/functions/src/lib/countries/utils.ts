import {
   getLocationIds,
   LocationOption,
} from "@careerfairy/shared-lib/countries/types"
import { Country, State } from "country-state-city"

export const getLocationById = (locationId: string): LocationOption | null => {
   const { countryIsoCode, stateIsoCode, cityName } = getLocationIds(locationId)

   if (!countryIsoCode) return null

   const country = Country.getCountryByCode(countryIsoCode)

   if (!country) return null

   if (stateIsoCode) {
      const state = State.getStateByCodeAndCountry(stateIsoCode, countryIsoCode)

      if (state) {
         if (cityName) {
            return {
               id: locationId,
               name: `${cityName} (${state.name}, ${country.name})`,
            }
         }

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
