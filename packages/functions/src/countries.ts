import {
   CityOption,
   CountryOption,
   generateCityId,
   getCityCodes,
} from "@careerfairy/shared-lib/countries/types"

import { City, Country, State } from "country-state-city"
import * as functions from "firebase-functions"
import { InferType, object, string } from "yup"
import config from "./config"

const CountryCitiesOptionsSchema = {
   countryCode: string().required(),
}

const CountryCitiesSchema = object().shape(CountryCitiesOptionsSchema)

const CountryCityDataOptionsSchema = {
   countryIsoCode: string().optional(),
   generatedCityId: string().optional(),
}

const CityDataOptionsSchema = {
   generatedCityId: string().optional(),
}

const CountryCityDataSchema = object().shape(CountryCityDataOptionsSchema)

const CityDataSchema = object().shape(CityDataOptionsSchema)

type CountryCitiesOptions = InferType<typeof CountryCitiesSchema>

type CountryCityDataOptions = InferType<typeof CountryCityDataSchema>

type CityDataOptions = InferType<typeof CityDataSchema>

export const fetchCountriesList = functions
   .region(config.region)
   .https.onCall(() => {
      const countries: CountryOption[] = Country.getAllCountries()
         .map((country) => ({
            name: country.name,
            id: country.isoCode,
         }))
         .sort((countryA, countryB) =>
            countryA.name.localeCompare(countryB.name)
         )

      const countriesMap: Record<string, CountryOption> = countries.reduce(
         (acc, country) => ({
            ...acc,
            [country.id]: country,
         }),
         {} as Record<string, CountryOption>
      )

      return countriesMap
   })

export const fetchCountryCitiesList = functions
   .region(config.region)
   .https.onCall((data: CountryCitiesOptions) => {
      const { countryCode } = data

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
   })

export const fetchCountryCityData = functions
   .region(config.region)
   .https.onCall((data: CountryCityDataOptions) => {
      const { countryIsoCode, generatedCityId } = data

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
   })

export const fetchCityData = functions
   .region(config.region)
   .https.onCall((data: CityDataOptions) => {
      const { generatedCityId } = data

      let cityResult: CityOption | null = null

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

      return cityResult
   })
