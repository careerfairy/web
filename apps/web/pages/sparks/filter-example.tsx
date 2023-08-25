import React, { useState } from "react"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import { Box } from "@mui/material"
import SparksFilterDialog from "components/views/sparks/components/spark-card/SparkFilterDialog"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { SparkCategory } from "@careerfairy/shared-lib/sparks/sparks"
import { Button } from "@mui/material"
const SparksPage = () => {
   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const [selectedCategories, setSelectedCategories] = useState<
      SparkCategory[]
   >([])

   return (
      <GenericDashboardLayout pageDisplayName={""}>
         <Box sx={{ display: "flex", justifyContent: "center", m: "30px" }}>
            <Button
               onClick={handleOpenDialog}
               color={"error"}
               variant={"contained"}
            >
               Filter example
            </Button>
            <SparksFilterDialog
               isOpen={isDialogOpen}
               handleClose={handleCloseDialog}
               selectedCategories={selectedCategories}
               setSelectedCategories={setSelectedCategories}
            />
         </Box>
      </GenericDashboardLayout>
   )
}
export default SparksPage
