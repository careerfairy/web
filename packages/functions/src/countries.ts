import {
   CityOption,
   CountryOption,
   generateCityId,
   generateCountryId,
   generateStateId,
   getCityCodes,
   getLocationIds,
} from "@careerfairy/shared-lib/countries/types"

import { City, Country, State } from "country-state-city"
import { onCall } from "firebase-functions/https"
import Fuse from "fuse.js"
import { InferType, object, string } from "yup"

const CountryCitiesOptionsSchema = {
   countryCode: string().required(),
}

const CountryCityDataOptionsSchema = {
   countryIsoCode: string().optional(),
   generatedCityId: string().optional(),
}

const SearchCountryOptionsSchema = {
   searchValue: string().required().min(2),
}

const SearchCityOptionsSchema = {
   searchValue: string().required().min(2),
   countryId: string().required(),
}

const CityDataOptionsSchema = {
   generatedCityId: string().optional(),
}

const CountryDataOptionsSchema = {
   countryIsoCode: string().required(),
}

const SearchLocationOptionsSchema = {
   searchValue: string().required().min(2),
}

const GetLocationOptionsSchema = {
   location: string().min(2).required(),
}

const CountryCitiesSchema = object().shape(CountryCitiesOptionsSchema)

const CountryCityDataSchema = object().shape(CountryCityDataOptionsSchema)

const CityDataSchema = object().shape(CityDataOptionsSchema)

const CountryDataSchema = object().shape(CountryDataOptionsSchema)

const SearchCountrySchema = object().shape(SearchCountryOptionsSchema)

const SearchCitySchema = object().shape(SearchCityOptionsSchema)

const SearchLocationSchema = object().shape(SearchLocationOptionsSchema)

const GetLocationSchema = object().shape(GetLocationOptionsSchema)

type CountryCitiesOptions = InferType<typeof CountryCitiesSchema>

type CountryCityDataOptions = InferType<typeof CountryCityDataSchema>

type CityDataOptions = InferType<typeof CityDataSchema>

type CountryDataOptions = InferType<typeof CountryDataSchema>

type SearchCountryOptions = InferType<typeof SearchCountrySchema>

type SearchCityOptions = InferType<typeof SearchCitySchema>

type SearchLocationOptions = InferType<typeof SearchLocationSchema>

type GetLocationOptions = InferType<typeof GetLocationSchema>

const performFuzzySearch = <T>(items: T[], searchValue: string): T[] => {
   // Configure Fuse options
   const fuseOptions = {
      keys: ["name"],
      threshold: 0.5, // Adjust this value to control fuzzy matching sensitivity
   }

   const fuse = new Fuse(items, fuseOptions)
   const searchResults = fuse.search(searchValue)

   return searchResults.map((result) => result.item)
}

export const searchCountries = onCall<SearchCountryOptions>((request) => {
   const { searchValue } = request.data

   const countries: CountryOption[] = Country.getAllCountries()
      .map((country) => ({
         name: country.name,
         id: country.isoCode,
      }))
      .sort((countryA, countryB) => countryA.name.localeCompare(countryB.name))

   return performFuzzySearch(countries, searchValue)
})

export const fetchCountriesList = onCall(() => {
   const countries: CountryOption[] = Country.getAllCountries()
      .map((country) => ({
         name: country.name,
         id: country.isoCode,
      }))
      .sort((countryA, countryB) => countryA.name.localeCompare(countryB.name))

   const countriesMap: Record<string, CountryOption> = countries.reduce(
      (acc, country) => ({
         ...acc,
         [country.id]: country,
      }),
      {} as Record<string, CountryOption>
   )

   return countriesMap
})

export const searchCities = onCall<SearchCityOptions>((request) => {
   const { searchValue, countryId } = request.data

   const states = State.getStatesOfCountry(countryId)
   const cities: CityOption[] = states
      .map((state) => ({
         name: state.name,
         id: state.isoCode,
         stateIsoCode: state.isoCode,
      }))
      .sort((cityA, cityB) => cityA.name.localeCompare(cityB.name))

   return performFuzzySearch(cities, searchValue)
})

export const fetchCountryCitiesList = onCall<CountryCitiesOptions>(
   (request) => {
      const { countryCode } = request.data

      const states = State.getStatesOfCountry(countryCode)

      const citiesData =
         states
            ?.map((state) => City.getCitiesOfState(countryCode, state.isoCode))
            ?.flat() ?? []

      const cities: CityOption[] =
         citiesData.map((city) => ({
            name: city.name,
            id: generateCityId(city),
            stateIsoCode: city.stateCode,
         })) ?? []

      const citiesMap: Record<string, CityOption> = cities
         .sort((cityA, cityB) => cityA.name.localeCompare(cityB.name))
         .reduce(
            (acc, city) => ({
               ...acc,
               [city.id]: city,
            }),
            {} as Record<string, CityOption>
         )

      return citiesMap
   }
)

export const fetchCountryStatesList = onCall<CountryCitiesOptions>(
   (request) => {
      const { countryCode } = request.data

      const states = State.getStatesOfCountry(countryCode)

      const cities: CityOption[] =
         states.map((state) => ({
            name: state.name,
            id: state.isoCode,
            stateIsoCode: state.isoCode,
         })) ?? []

      const citiesMap: Record<string, CityOption> = cities
         .sort((cityA, cityB) => cityA.name.localeCompare(cityB.name))
         .reduce(
            (acc, city) => ({
               ...acc,
               [city.id]: city,
            }),
            {} as Record<string, CityOption>
         )
      return citiesMap
   }
)

export const fetchCountryCityData = onCall<CountryCityDataOptions>(
   (request) => {
      const { countryIsoCode, generatedCityId } = request.data

      let countryResult: CountryOption | undefined
      let cityResult: CityOption | undefined

      if (countryIsoCode) {
         const country = Country.getCountryByCode(countryIsoCode)
         countryResult = {
            name: country.name,
            id: country.isoCode,
         }
      }

      if (generatedCityId) {
         const { countryCode, stateCode, cityName } =
            getCityCodes(generatedCityId)

         const city = City.getCitiesOfState(countryCode, stateCode)?.find(
            (city) => city.name === cityName
         )

         cityResult = {
            name: city.name,
            id: generateCityId(city),
            stateIsoCode: stateCode,
         }
      }

      return { country: countryResult, city: cityResult }
   }
)

export const fetchCityData = onCall<CityDataOptions>((request) => {
   const { generatedCityId } = request.data

   let cityResult: CityOption | null = null

   if (generatedCityId) {
      const { countryCode, stateCode, cityName } = getCityCodes(generatedCityId)

      const city = City.getCitiesOfState(countryCode, stateCode)?.find(
         (city) => city.name === cityName
      )

      cityResult = {
         name: city.name,
         id: generateCityId(city),
         stateIsoCode: stateCode,
      }
   }

   return cityResult
})

export const fetchCountryData = onCall<CountryDataOptions>((request) => {
   const { countryIsoCode } = request.data

   let countryResult: CountryOption | null = null

   if (countryIsoCode) {
      const country = Country.getCountryByCode(countryIsoCode)

      countryResult = {
         name: country.name,
         id: country.isoCode,
      }
   }

   return countryResult
})

export const searchLocations = onCall<SearchLocationOptions>((request) => {
   const { searchValue } = request.data

   if (searchValue.length < 2) {
      return null
   }

   const countries = Country.getAllCountries()
      .map((country) => ({
         name: country.name,
         id: generateCountryId(country),
      }))
      .sort((countryA, countryB) => countryA.name.localeCompare(countryB.name))

   const states = State.getAllStates()
      .map((state) => ({
         name: `${state.name}, ${
            Country.getCountryByCode(state.countryCode)?.name
         }`,
         id: generateStateId(state),
      }))
      .sort((stateA, stateB) => stateA.name.localeCompare(stateB.name))

   // const cities = City.getAllCities()
   //    .map((city) => ({
   //       name: `${city.name}, ${Country.getCountryByCode(city.countryCode)?.name}`,
   //       id: generateCityId(city),
   //    }))
   //    .sort((cityA, cityB) => cityA.name.localeCompare(cityB.name))

   const locations = [...countries, ...states]

   return performFuzzySearch(locations, searchValue).slice(0, 20)
})

export const getLocation = onCall<GetLocationOptions>((request) => {
   const { searchValue } = request.data

   const { countryIsoCode, stateIsoCode } = getLocationIds(searchValue)
   console.log("🚀 ~ countryIsoCode:", countryIsoCode)
   console.log("🚀 ~ stateIsoCode:", stateIsoCode)

   if (!countryIsoCode) return null

   const country = Country.getCountryByCode(countryIsoCode)
   if (stateIsoCode) {
      const state = State.getStateByCodeAndCountry(stateIsoCode, countryIsoCode)
      console.log("🚀 ~ state:", state)
      return {
         id: searchValue,
         name: `${state.name}, ${country.name}`,
      }
   }

   return {
      id: searchValue,
      name: country.name,
   }
})
