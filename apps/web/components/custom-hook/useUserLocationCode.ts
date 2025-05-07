import { useAuth } from "HOCs/AuthProvider"
import useUserCountryCode from "./useUserCountryCode"

export const useUserLocationCode = () => {
   const { userCountryCode: ipBasedCountryCode } = useUserCountryCode()
   const { userData } = useAuth()

   return {
      countryCode: userData?.countryIsoCode || ipBasedCountryCode,
   }
}
