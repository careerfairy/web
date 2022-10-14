import React from "react"
import StepsView from "../common/StepsView"
import { Divider, Stack, Typography } from "@mui/material"
import ResourcesView from "../common/ResourcesView"
import FaqView from "../common/FaqView"
import { sxStyles } from "../../../../../../types/commonTypes"
import GenericDialog from "../../../../common/GenericDialog"

const styles = sxStyles({
   divider: {
      mx: (theme) => `${theme.spacing(5)} !important`,
      bgcolor: "none",
      borderBottom: (theme) => `2px solid ${theme.palette.tertiary.main}`,
   },
})

const DebugModal = () => {
   return (
      <GenericDialog
         title={"Having issues? Here are some possible fixes:"}
         titleOnCenter
         showCloseBtn={false}
         maxWidth={"md"}
      >
         <Stack
            divider={<Divider variant={"middle"} sx={styles.divider} />}
            spacing={2}
         >
            <StepsView stepIds={["refresh"]} />
            <ResourcesView />
            <FaqView />
            <Typography align={"center"} variant={"body1"}>
               Still having issues? Read our{" "}
               <a
                  color="inherit"
                  target="_blank"
                  href="https://careerfairy-support.crisp.help/"
                  rel="noreferrer"
               >
                  trouble shooting documentation{" "}
               </a>
               or contact us at{" "}
               <a
                  color="inherit"
                  target="_blank"
                  href="mailto:thomas@careerfairy.io"
                  rel="noreferrer"
               >
                  Get in touch with the CareerFairy Team
               </a>
            </Typography>
         </Stack>
      </GenericDialog>
   )
}

export default DebugModal
