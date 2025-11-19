import {
   CityOption,
   CountryOption,
   LocationOption,
   generateCityId,
   generateCountryId,
   generateStateId,
   getCityCodes,
   getLocationIds,
} from "@careerfairy/shared-lib/countries/types"

import { City, Country, State } from "country-state-city"
import { onCall } from "firebase-functions/https"
import Fuse from "fuse.js"
import { InferType, array, number, object, string } from "yup"
import { getLocationById } from "./lib/countries/utils"
import { warmingMiddleware } from "./middlewares-gen2/onCall/validations"
import { middlewares } from "./middlewares/middlewares"

const SEARCH_LOCATION_LIMIT = 10

// Countries for which cities are included in location search
// This list can be easily expanded by adding more ISO country codes
const SEARCHABLE_CITIES_COUNTRIES = [
   "AT", // Austria
   "BE", // Belgium
   "FR", // France
   "DE", // Germany
   "LI", // Liechtenstein
   "LU", // Luxembourg
   "IE", // Ireland
   "IT", // Italy
   "NL", // Netherlands
   "PL", // Poland
   "ES", // Spain
   "SE", // Sweden
   "CH", // Switzerland
   "GB", // United Kingdom
]

// Cache for all searchable data to avoid regeneration
// This cache significantly improves performance by avoiding repeated data generation
let cachedSearchableCountries: LocationOption[] | null = null
let cachedSearchableStates: LocationOption[] | null = null
let cachedSearchableCities: LocationOption[] | null = null

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
   searchValue: string().optional(),
   limit: number().optional().default(SEARCH_LOCATION_LIMIT),
   initialLocationIds: array().of(string()).optional(),
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

const performFuzzySearch = <T>(
   items: T[],
   searchValue: string,
   limit?: number
): T[] => {
   // Early return for short search values
   if (searchValue.length < 2) return []

   // Configure Fuse options for better performance
   const fuseOptions = {
      keys: ["name"],
      threshold: 0.4, // More strict matching for better performance
      distance: 100, // Limit search distance
      maxPatternLength: 32, // Limit pattern length
      minMatchCharLength: 2, // Minimum match length
      includeScore: false, // Don't include scores to save memory
      shouldSort: true, // Sort results by relevance
      findAllMatches: false, // Stop at first good match per item
   }

   const fuse = new Fuse(items, fuseOptions)
   const searchResults = fuse.search(searchValue, { limit: limit || 10 })

   return searchResults.map((result) => result.item)
}

const generateSearchableCities = (): LocationOption[] => {
   const cities: LocationOption[] = []

   SEARCHABLE_CITIES_COUNTRIES.forEach((countryCode) => {
      const country = Country.getCountryByCode(countryCode)
      if (!country) return

      const states = State.getStatesOfCountry(countryCode)

      states.forEach((state) => {
         const stateCities = City.getCitiesOfState(countryCode, state.isoCode)

         stateCities?.forEach((city) => {
            cities.push({
               id: generateCityId(city),
               name: `${city.name} (${state.name}, ${country.name})`,
            })
         })
      })
   })

   return cities.sort((cityA, cityB) => cityA.name.localeCompare(cityB.name))
}

const generateSearchableCountries = (): LocationOption[] => {
   const countries: LocationOption[] = []

   SEARCHABLE_CITIES_COUNTRIES.forEach((countryCode) => {
      const country = Country.getCountryByCode(countryCode)
      if (!country) return

      countries.push({
         name: country.name,
         id: generateCountryId(country),
      })
   })

   return countries.sort((countryA, countryB) =>
      countryA.name.localeCompare(countryB.name)
   )
}

const generateSearchableStates = (): LocationOption[] => {
   const states: LocationOption[] = []

   SEARCHABLE_CITIES_COUNTRIES.forEach((countryCode) => {
      const country = Country.getCountryByCode(countryCode)
      if (!country) return

      const countryStates = State.getStatesOfCountry(countryCode)

      countryStates.forEach((state) => {
         states.push({
            id: generateStateId(state),
            name: `${state.name} (${country.name})`,
         })
      })
   })

   return states.sort((stateA, stateB) =>
      stateA.name.localeCompare(stateB.name)
   )
}

const getSearchableCities = (): LocationOption[] => {
   if (!cachedSearchableCities) {
      cachedSearchableCities = generateSearchableCities()
   }
   return cachedSearchableCities
}

const getSearchableCountries = (): LocationOption[] => {
   if (!cachedSearchableCountries) {
      cachedSearchableCountries = generateSearchableCountries()
   }
   return cachedSearchableCountries
}

const getSearchableStates = (): LocationOption[] => {
   if (!cachedSearchableStates) {
      cachedSearchableStates = generateSearchableStates()
   }
   return cachedSearchableStates
}

const performTieredLocationSearch = (
   searchValue: string,
   limit: number
): LocationOption[] => {
   // Separate result arrays to control final ordering
   const countryResults: LocationOption[] = []
   const stateResults: LocationOption[] = []
   const cityResults: LocationOption[] = []
   const seen = new Set<string>()

   // 1. Search countries first (computational priority)
   const countries = getSearchableCountries()
   const countryMatches = performFuzzySearch(
      countries,
      searchValue,
      Math.ceil(limit * 0.3)
   )

   countryMatches.forEach((location) => {
      if (
         !seen.has(location.id) &&
         countryResults.length < Math.ceil(limit * 0.3)
      ) {
         countryResults.push(location)
         seen.add(location.id)
      }
   })

   // 2. Search states (computational priority)
   const states = getSearchableStates()
   const stateMatches = performFuzzySearch(
      states,
      searchValue,
      Math.ceil(limit * 0.4)
   )

   stateMatches.forEach((location) => {
      if (
         !seen.has(location.id) &&
         stateResults.length < Math.ceil(limit * 0.4)
      ) {
         stateResults.push(location)
         seen.add(location.id)
      }
   })

   // 3. Search cities (lowest computational priority, only if we need more results)
   const currentResultsCount = countryResults.length + stateResults.length
   const remainingLimit = limit - currentResultsCount

   if (remainingLimit > 0) {
      const cities = getSearchableCities()
      const cityMatches = performFuzzySearch(
         cities,
         searchValue,
         remainingLimit
      )

      cityMatches.forEach((location) => {
         if (!seen.has(location.id) && cityResults.length < remainingLimit) {
            cityResults.push(location)
            seen.add(location.id)
         }
      })
   }

   // Return results with cities first (user experience priority)
   return [...countryResults, ...cityResults, ...stateResults].slice(0, limit)
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

export const searchLocations = onCall<SearchLocationOptions>(
   {
      memory: "2GiB",
   },
   middlewares<SearchLocationOptions>(warmingMiddleware(), async (request) => {
      const { searchValue, limit, initialLocationIds } = request.data

      let locations: LocationOption[] = []

      if (searchValue?.length > 2) {
         // Use tiered search for better performance and relevance
         locations = performTieredLocationSearch(
            searchValue,
            limit || SEARCH_LOCATION_LIMIT
         )
      }

      const locationsMap: Record<string, boolean> = Object.fromEntries(
         locations.map((location) => [location.id, true])
      )

      initialLocationIds?.forEach((locationId) => {
         const location = getLocationById(locationId)

         if (!location) return

         location && !locationsMap[locationId] && locations.push(location)
      })

      return locations
   })
)

export const getLocation = onCall<GetLocationOptions>(
   middlewares<GetLocationOptions>(warmingMiddleware(), async (request) => {
      const { searchValue } = request.data

      const { countryIsoCode, stateIsoCode, cityName } =
         getLocationIds(searchValue)

      if (!countryIsoCode) return null

      const country = Country.getCountryByCode(countryIsoCode)
      if (stateIsoCode) {
         const state = State.getStateByCodeAndCountry(
            stateIsoCode,
            countryIsoCode
         )

         if (cityName) {
            return {
               id: searchValue,
               name: `${cityName} (${state.name}, ${country.name})`,
            }
         }
         return {
            id: searchValue,
            name: `${state.name} (${country.name})`,
         }
      }

      return {
         id: searchValue,
         name: country.name,
      }
   })
)
