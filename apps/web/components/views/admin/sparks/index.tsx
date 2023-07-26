import { Container } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupSparks from "components/custom-hook/spark/useGroupSparks"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Fragment } from "react"
import { sxStyles } from "types/commonTypes"
import EmptySparksView from "./empty-sparks-view/EmptySparksView"
import GeneralSparksPage from "./general-sparks-view/GeneralSparksView"
import SparksDialog from "./sparks-dialog/SparksDialog"

const styles = sxStyles({
   root: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      pt: 2.875,
   },
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
   const { data } = useGroupSparks(group.id)

   const groupHasSparks = data.length > 0

   return (
      <Fragment>
         <Container sx={styles.root} maxWidth="xl">
            {groupHasSparks ? <GeneralSparksPage /> : <EmptySparksView />}
         </Container>
         <SparksDialog />
      </Fragment>
   )
}

export default Sparks
