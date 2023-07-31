import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupHasSparks from "components/custom-hook/spark/useGroupHasSparks"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Fragment } from "react"
import EmptySparksView from "./empty-sparks-view/EmptySparksView"
import GeneralSparksView from "./general-sparks-view/GeneralSparksView"
import SparksDialog from "./sparks-dialog/SparksDialog"

const Sparks = () => {
   return (
      <SuspenseWithBoundary fallback="Loading...">
         <SparksComponent />
      </SuspenseWithBoundary>
   )
}

const SparksComponent = () => {
   const { group } = useGroup()

   const groupHasSparks = useGroupHasSparks(group.id)

   return (
      <Fragment>
         {groupHasSparks ? <GeneralSparksView /> : <EmptySparksView />}
         <SparksDialog />
      </Fragment>
   )
}

export default Sparks
