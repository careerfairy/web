import { useFirestoreDocument } from "../utils/useFirestoreDocument"

type TokenSWRResponse = {
   value: string
   id: string
}
const useLivestreamSecureTokenSWR = (livestreamId: string) => {
   return useFirestoreDocument<TokenSWRResponse>("livestreams", [
      livestreamId,
      "tokens",
      "secureToken",
   ])
}

export default useLivestreamSecureTokenSWR
