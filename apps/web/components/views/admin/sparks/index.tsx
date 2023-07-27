import { Container } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupCreators from "components/custom-hook/creator/useGroupCreators"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Fragment } from "react"
import { sxStyles } from "types/commonTypes"
import EmptySparksView from "./empty-sparks-view/EmptySparksView"
import GeneralSparksView from "./general-sparks-view/GeneralSparksView"
import SparksDialog from "./sparks-dialog/SparksDialog"
import {
   containerDesktopHorizontalPadding,
   containerMobileHorizontalPadding,
} from "./general-sparks-view/OverflowWrapper"
import useGroupHasSparks from "components/custom-hook/spark/useGroupHasSparks"
import { useSelector } from "react-redux"
import { sparksShowHiddenSparks } from "store/selectors/adminSparksSelectors"

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
