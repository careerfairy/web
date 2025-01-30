import { UserData } from "../users"

export const europeCountryFilters = [
   "AT",
   "AD",
   "BE",
   "BG",
   "CH",
   "CZ",
   "DE",
   "DK",
   "EE",
   "ES",
   "FI",
   "FR",
   "GB",
   "GR",
   "HR",
   "HU",
   "IE",
   "IT",
   "LI",
   "LU",
   "MC",
   "MT",
   "NL",
   "NO",
   "PL",
   "PT",
   "RO",
   "RS",
   "SE",
   "SI",
   "SK",
   "SM",
]

export const swissGermanCountryFilters = ["DE", "CH"]

export const userIsTargetedApp = (userData: UserData) =>
   userData &&
   europeCountryFilters.includes(userData.universityCountryCode) &&
   (!userData.fcmTokens || userData.fcmTokens?.length === 0) // check if user hasn't downloaded the app

export const userIsTargetedLevels = (userData: UserData) =>
   userData &&
   (swissGermanCountryFilters.includes(userData.universityCountryCode) ||
      swissGermanCountryFilters.includes(userData.countryIsoCode))
