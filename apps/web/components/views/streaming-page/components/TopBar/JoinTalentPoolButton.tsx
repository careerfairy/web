import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useTalentPool from "components/custom-hook/live-stream/useTalentPool"
import { useLivestreamData } from "components/custom-hook/streaming"
import { useRouter } from "next/router"
import { Check, User } from "react-feather"
import { useOpenStream } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { ResponsiveStreamButton } from "../Buttons"

const styles = sxStyles({
   joinedButton: {
      color: (theme) => theme.brand.black[700],
   },
})

export const JoinTalentPoolButton = () => {
   const { push, asPath } = useRouter()
   const isOpenStream = useOpenStream()

   if (isOpenStream) {
      return (
         <ResponsiveStreamButton
            onClick={() => {
               return push({
                  query: { absolutePath: asPath },
                  pathname: "/login",
               })
            }}
            startIcon={<User />}
            variant="outlined"
         >
            Join talent pool
         </ResponsiveStreamButton>
      )
   }

   return (
      <SuspenseWithBoundary fallback={<></>}>
         <Button />
      </SuspenseWithBoundary>
   )
}

const Button = () => {
   const livestream = useLivestreamData()
   const {
      loading,
      userIsInTalentPool,
      handlers: { joinTalentPool, leaveTalentPool },
   } = useTalentPool(livestream)

   const handleJoinTalentPool = () => {
      joinTalentPool()
   }

   const handleLeaveTalentPool = () => {
      leaveTalentPool()
   }

   if (userIsInTalentPool) {
      return (
         <ResponsiveStreamButton
            onClick={handleLeaveTalentPool}
            startIcon={<Check />}
            variant="text"
            loading={loading}
            sx={styles.joinedButton}
         >
            Joined talent pool
         </ResponsiveStreamButton>
      )
   }

   return (
      <ResponsiveStreamButton
         onClick={handleJoinTalentPool}
         startIcon={<User />}
         variant="outlined"
         loading={loading}
      >
         Join talent pool
      </ResponsiveStreamButton>
   )
}
