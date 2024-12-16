import {
   CityOption,
   CountryOption,
   generateCityId,
} from "@careerfairy/shared-lib/countries/types"

import { City, Country } from "country-state-city"
import { onRequest } from "firebase-functions/v2/https"

export const fetchCountriesList = onRequest(async (_, res) => {
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

   res.status(200).json({ data: countriesMap })
})

export const fetchCountryCitiesList = onRequest(async (req, res) => {
   const { countryCode } = req.body.data

   if (!countryCode) {
      res.status(200).json({ data: [] })
      return
   }

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

   res.status(200).json({ data: citiesMap })
})
