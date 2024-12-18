import {
   CityOption,
   CountryOption,
   generateCityId,
} from "@careerfairy/shared-lib/countries/types"

import { City, Country } from "country-state-city"
import * as functions from "firebase-functions"
import { InferType, object, string } from "yup"
import config from "./config"

const CountryCitiesOptionsSchema = {
   countryCode: string().required(),
}

const CountryCitiesSchema = object().shape(CountryCitiesOptionsSchema)

type CountryCitiesOptions = InferType<typeof CountryCitiesSchema>

export const fetchCountriesList = functions
   .region(config.region)
   .https.onCall(() => {
      const countries: CountryOption[] = Country.getAllCountries().map(
         (country) => ({
            name: country.name,
            id: country.isoCode,
         })
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

      const cities: CityOption[] =
         City.getCitiesOfCountry(countryCode)?.map((city) => ({
            name: city.name,
            id: generateCityId(city),
         })) ?? []

      const citiesMap: Record<string, CityOption> = cities.reduce(
         (acc, city) => ({
            ...acc,
            [city.id]: city,
         }),
         {} as Record<string, CityOption>
      )

      return citiesMap
   })
