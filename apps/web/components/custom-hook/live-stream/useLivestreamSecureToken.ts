import { useFirestoreDocument } from "../utils/useFirestoreDocument"

export type useLivestreamSecureTokenOptions = {
   livestreamId: string
   disabled?: boolean
}

type TokenSWR = {
   value: string
   id: string
}
const useLivestreamSecureTokenSWR = (
   options: useLivestreamSecureTokenOptions
) => {
   return useFirestoreDocument<TokenSWR>("livestreams", [
      options.livestreamId,
      "tokens",
      "secureToken",
   ])
}

export default useLivestreamSecureTokenSWR
