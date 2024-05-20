import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useTalentPool from "components/custom-hook/live-stream/useTalentPool"
import { Check, User } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { ResponsiveStreamButton } from "../Buttons"

const styles = sxStyles({
   joinedButton: {
      color: (theme) => theme.brand.black[700],
   },
})

export const JoinTalentPoolButton = ({ livestream }) => {
   return (
      <SuspenseWithBoundary fallback={<></>}>
         <Button livestream={livestream} />
      </SuspenseWithBoundary>
   )
}

const Button = ({ livestream }) => {
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
