import { ICity, ICountry, IState } from "country-state-city"

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
