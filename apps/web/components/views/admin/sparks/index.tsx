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

const styles = sxStyles({
   root: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      pt: 2.875,
      position: "relative",
      overflow: "visible",
      px: {
         xs: `${containerMobileHorizontalPadding}px !important`,
         md: `${containerDesktopHorizontalPadding}px !important`,
      },
   },
   container: {},
})

const Sparks = () => {
   return (
      <SuspenseWithBoundary fallback="Loading...">
         <SparksComponent />
      </SuspenseWithBoundary>
   )
}

const SparksComponent = () => {
   const { group } = useGroup()
   const { data } = useGroupCreators(group.id)

   const groupHasSparks = data.length > 0

   return (
      <Fragment>
         <Container sx={styles.root} maxWidth="xl">
            {groupHasSparks ? <GeneralSparksView /> : <EmptySparksView />}
         </Container>
         <SparksDialog />
      </Fragment>
   )
}

export default Sparks
