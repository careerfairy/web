import { ICity, ICountry, IState } from "country-state-city"
import { removeDuplicates } from "../utils"

/**
 * This file contains functions to generate and manipulate location ids.
 *
 * The location ids are generated based on the country, state, and city and have
 * a set of rules:
 * - The country is the first segment.
 * - The state is the second segment.
 * - The city is the third segment.
 *
 * All implemented functions are based on the above rules.
 */

export type CountryOption = {
   name: string
   id: string // ISO code
}

export type CityOption = {
   name: string
   id: string // Generated id based on countryCode and stateCode, see @generateCityId.
   stateIsoCode?: string
}

export const generateCityId = (city: ICity) => {
   return `${city.countryCode}-${city.stateCode}-${city.name}`
}

export const generateStateId = (state: IState) => {
   return `${state.countryCode}-${state.isoCode}`
}

export const generateCountryId = (country: ICountry) => {
   return country.isoCode
}

export const getLocationIds = (location: string) => {
   const segments = location.split("-")
   return {
      countryIsoCode: segments?.at(0),
      stateIsoCode: segments?.at(1),
      cityName: segments?.at(2),
   }
}

export const getLocationId = (
   countryIsoCode?: string,
   stateIsoCode?: string,
   cityName?: string
) => {
   return `${countryIsoCode}${stateIsoCode ? `-${stateIsoCode}` : ""}${
      cityName ? `-${cityName}` : ""
   }`
}

export const getCityCodes = (generatedCityId: string) => {
   const [countryCode, stateCode, cityName] = generatedCityId.split("-")
   return { countryCode, stateCode, cityName }
}

/**
 * Returns the ids from `otherLocationIds` that belong to the same location hierarchy as `location`.
 *
 * @param location - A location id (country, state, or city id)
 * @param otherLocationIds - Array of location ids to check
 * @returns string[] - The ids from otherLocationIds that are in the same location hierarchy as location
 */
export const inLocation = (
   location: string,
   otherLocationIds: string[]
): string[] => {
   const locationSegments = location?.split("-") ?? []
   const locationDepth = locationSegments.length

   return (
      otherLocationIds?.filter((id) => {
         const idSegments = id.split("-")
         // Must match at least as deep as the location's specificity
         if (idSegments.length < locationDepth) return false
         // For city-level, require exact match
         if (locationDepth === 3) {
            return id === location
         }
         // For country/state, all segments up to the location's depth must match
         for (let i = 0; i < locationDepth; i++) {
            if (idSegments[i] !== locationSegments[i]) return false
         }
         return true
      }) ?? []
   )
}

/**
 * Returns all the possible normalized location ids for a given location id.
 *
 * From a single location id, we can generate a list of normalized location ids, which
 * includes all the possible location hierarchies, which can be used for filtering.
 *
 * For example, for the location id "US-CA-San Francisco", we can generate the following normalized location ids:
 * - Country_US
 * - Country_US_State_CA
 * - Country_US_State_CA_City_San Francisco
 *
 * So when filtering, we can set the level of precision.
 * When having selected just a country, the filter will be Country_US, returning all the jobs in the US. Jobs which
 * are in a specific state or city will be considered as well (When filtering with Country_US), since any state
 * or city is a subset of the US.
 *
 * When having selected a state, the filter will be Country_US_State_CA, returning all the jobs in the US, in the state of California.
 * Jobs which are in a specific city will be considered as well (When filtering with Country_US_State_CA), since any city is a subset of the state of California.
 *
 * When having selected a city, the filter will be Country_US_State_CA_City_San Francisco, returning all the jobs in the US, in the state of California, in the city of San Francisco.
 *
 * @param locationId - A location id (country, state, or city id)
 * @returns string[] - All the possible normalized location ids for the given location id
 */
export const normalizeLocationId = (locationId: string): string[] => {
   const { countryIsoCode, stateIsoCode, cityName } = getLocationIds(locationId)

   const combinations = []
   if (countryIsoCode) {
      const countryId = `Country_${countryIsoCode}`
      combinations.push(countryId)

      if (stateIsoCode) {
         const stateId = `${countryId}_State_${stateIsoCode}`
         combinations.push(stateId)

         if (cityName) {
            const cityId = `${countryId}_State_${stateIsoCode}_City_${cityName}`
            combinations.push(cityId)
         }
      }
   }

   return combinations
}

export const normalizeLocationIds = (locationIds: string[]): string[] => {
   return removeDuplicates(locationIds?.map(normalizeLocationId)?.flat() ?? [])
}

/**
 * Returns the normalized location id for a given location id to be used as a filter value.
 *
 * Unlike the normalizeLocationId function, this function only returns the highest level of precision
 * and does not return all the possible location hierarchies.
 *
 * @param locationId - A location id (country, state, or city id)
 * @returns string - The normalized location id for the given location id
 */
export const normalizeLocationIdForFiltering = (locationId: string): string => {
   const { countryIsoCode, stateIsoCode, cityName } = getLocationIds(locationId)

   let id = ""
   if (countryIsoCode) {
      const countryId = `Country_${countryIsoCode}`
      id = countryId

      if (stateIsoCode) {
         const stateId = `${countryId}_State_${stateIsoCode}`
         id = stateId

         if (cityName) {
            const cityId = `${stateId}_City_${cityName}`
            id = cityId
         }
      }
   }

   return id
}

export const normalizeLocationIdsForFiltering = (
   locationIds: string[]
): string[] => {
   return removeDuplicates(
      locationIds?.map(normalizeLocationIdForFiltering) ?? []
   )
}
