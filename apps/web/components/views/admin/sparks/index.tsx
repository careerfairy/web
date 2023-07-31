import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupHasSparks from "components/custom-hook/spark/useGroupHasSparks"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Fragment } from "react"
import { useSelector } from "react-redux"
import { sparksShowHiddenSparks } from "store/selectors/adminSparksSelectors"
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
   const showHiddenSparks = useSelector(sparksShowHiddenSparks)

   const groupHasSparks = useGroupHasSparks(group.id, showHiddenSparks)

   return (
      <Fragment>
         {groupHasSparks ? <GeneralSparksView /> : <EmptySparksView />}
         <SparksDialog />
      </Fragment>
   )
}

export default Sparks
