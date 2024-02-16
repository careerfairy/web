import { Form } from "formik"
import { Stack } from "@mui/material"
import Categories from "./Categories"
import ReasonsToJoin from "./ReasonsToJoin"
import { sxStyles } from "types/commonTypes"
import GeneralSettings from "./GeneralSettings"
import AudienceTargeting from "./AudienceTargeting"

const styles = sxStyles({
   root: {
      padding: "24px",
   },
})

const LivestreamFormGeneralStep = () => {
   return (
      <Form>
         <Stack sx={styles.root} rowGap={2}>
            <GeneralSettings />
            <ReasonsToJoin />
            <Categories />
            <AudienceTargeting />
         </Stack>
      </Form>
   )
}

export default LivestreamFormGeneralStep
