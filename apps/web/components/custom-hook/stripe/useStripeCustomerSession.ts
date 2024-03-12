import axios from "axios"
import { StripeCustomerSessionResponseData } from "pages/api/checkout_sessions"
import { useMemo, useState } from "react"

type Props = {
   groupId: string
}
type StripeCustomerSession = {
   isLoading: boolean
   data: StripeCustomerSessionResponseData
}

/**
 * Hook that provides functionality to upload a user's CV to Firebase storage.
 * @returns An object containing upload related state and methods.
 */
const useStripeCustomerSession = ({
   groupId,
}: Props): StripeCustomerSession => {
   const [isLoading, setIsLoading] = useState(false)
   const [data, setData] = useState<StripeCustomerSessionResponseData>()

   useMemo(() => {
      setIsLoading(true)
      axios
         .post<StripeCustomerSessionResponseData>("/api/checkout_sessions", {
            groupId: groupId,
         })
         .then((res) => {
            if (res.status == 200) {
               console.log(
                  "🚀 ~ fetchData ~ apiData: fetched customer session",
                  groupId
               )
               setData(res.data)
            }
         })
         .catch((err) => {
            console.error("Error creating API customer session: ", err)
            setIsLoading(false)
         })
   }, [groupId])

   return { data: data, isLoading: isLoading }
}

export default useStripeCustomerSession
