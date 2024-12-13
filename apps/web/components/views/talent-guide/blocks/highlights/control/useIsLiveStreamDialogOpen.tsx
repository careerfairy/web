import { useRouter } from "next/router"

export const useIsLiveStreamDialogOpen = () => {
   const router = useRouter()
   return Boolean(router.query.livestreamId)
}
