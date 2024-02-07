import { useFirestoreDocument } from "../utils/useFirestoreDocument"

type UseLivestreamSecureTokenOptions = {
   livestreamId: string
}

type TokenSWRResponse = {
   value: string
   id: string
}
const useLivestreamSecureTokenSWR = (
   options: UseLivestreamSecureTokenOptions
) => {
   return useFirestoreDocument<TokenSWRResponse>("livestreams", [
      options.livestreamId,
      "tokens",
      "secureToken",
   ])
}

export default useLivestreamSecureTokenSWR
