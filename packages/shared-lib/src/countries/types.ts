import { ICity } from "country-state-city"

export type CountryOption = {
   name: string
   id: string // ISO code
}

export type CityOption = {
   name: string
   id: string // Generated id based on countryCode and stateCode, see @generateCityId.
}

export const generateCityId = (city: ICity) => {
   return `${city.countryCode}-${city.stateCode}-${city.name}`
}

export const getCityCodes = (generatedCityId: string) => {
   const [countryCode, stateCode, cityName] = generatedCityId.split("-")
   return { countryCode, stateCode, cityName }
}
