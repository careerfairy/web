import { ICity, ICountry, IState } from "country-state-city"

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
   cityIsoCode?: string,
   stateIsoCode?: string,
   cityName?: string
) => {
   return `${cityIsoCode}${stateIsoCode ? `-${stateIsoCode}` : ""}${
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
