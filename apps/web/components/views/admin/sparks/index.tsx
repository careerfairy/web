import { Container } from "@mui/material"
import EmptySparksView from "./EmptySparksView"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
   },
})

const Sparks = () => {
   return (
      <Container sx={styles.root} maxWidth="xl">
         <EmptySparksView />
      </Container>
   )
}

export default Sparks
