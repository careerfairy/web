import { Box } from "@mui/material"
import SelectCreatorDropDown from "components/views/common/creator/SelectCreatorDropDown"
import React from "react"
import { sxStyles } from "types/commonTypes"
import SparksDialog from "../SparksDialog"
import { Creator, dummyCreators } from "@careerfairy/shared-lib/groups/creators"

const styles = sxStyles({
   root: {
      m: "auto",
      width: "100%",
   },
})

type Props = {}

const SelectCreatorView = (props: Props) => {
   return (
      <SparksDialog.Container sx={styles.root}>
         <SparksDialog.Title>
            Select a{" "}
            <Box component="span" color="secondary.main">
               creator
            </Box>
         </SparksDialog.Title>
         <SparksDialog.Subtitle>
            A creator is the “star” of your spark. A creator is the employee
            featured in a Spark.
         </SparksDialog.Subtitle>
         <Box mt={5} />
         <SelectCreatorDropDown creators={dummyCreators} />
      </SparksDialog.Container>
   )
}

export default SelectCreatorView
