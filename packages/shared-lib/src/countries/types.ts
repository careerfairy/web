export type CountryOption = {
   name: string
   id: string // ISO code
}

export type CityOption = {
   name: string
   countryCode: string
   stateCode: string
}
