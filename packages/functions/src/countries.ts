import {
   CityOption,
   CountryOption,
} from "@careerfairy/shared-lib/countries/types"
import { City, Country } from "country-state-city"
import { onRequest } from "firebase-functions/v2/https"
import { pick } from "lodash"

export const fetchCountriesList = onRequest(async (_, res) => {
   const countries: CountryOption[] = Country.getAllCountries().map(
      (country) => ({
         name: country.name,
         id: country.isoCode,
      })
   )

   res.status(200).json({ data: countries })
})

export const fetchCountryCitiesList = onRequest(async (req, res) => {
   const { countryCode } = req.body.data

   console.log("🚀 ~ countryCode:", countryCode)

   if (!countryCode) {
      res.status(200).json({ data: [] })
      return
   }

   const cities: CityOption[] = City.getCitiesOfCountry(countryCode).map(
      (city) => pick(city, ["name", "countryCode", "stateCode"])
   )

   res.status(200).json({ data: cities })
})
