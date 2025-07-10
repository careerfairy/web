import { useFeatureFlags } from "components/custom-hook/useFeatureFlags"
import { useRouter } from "next/router"
import { ReactNode, useEffect } from "react"
import { useGroup } from "./index"

type Props = {
   children: ReactNode
}

export const HasAccessToSparksWrapper = ({ children }: Props) => {
   const { group } = useGroup()
   const featureFlags = useFeatureFlags()
   const { replace } = useRouter()

   const hasAccessToSparks = Boolean(
      featureFlags?.sparksAdminPageFlag || group?.sparksAdminPageFlag
   )

   useEffect(() => {
      if (group && !hasAccessToSparks) {
         replace(`/group/${group.id}/admin`)
      }
   }, [hasAccessToSparks, group?.id, replace, group])

   return <>{children}</>
}
