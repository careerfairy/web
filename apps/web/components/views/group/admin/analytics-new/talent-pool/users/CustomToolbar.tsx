import React from "react"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { Card, Grid } from "@mui/material"
import Stack from "@mui/material/Stack"
import { CountriesSelect } from "../../../common/table/CountriesSelect"
import UniversitySelect from "../../../common/table/UniversitySelect"
import FieldOfStudySelect from "../../../common/table/FieldOfStudySelect"
import LevelOfStudySelect from "../../../common/table/LevelOfStudySelect"
import { LoadingButton } from "@mui/lab"
import { useExportUsers } from "../../../common/table/hooks"
import { useUserDataTable } from "../../../common/table/UserDataTableProvider"
import { CSVDialogDownload } from "../../../../../../custom-hook/useMetaDataActions"

const styles = sxStyles({
   root: {
      flex: 1,
   },
   filters: {
      p: 1.2,
      flex: 1,
      "& .MuiAutocomplete-inputRoot": {
         paddingRight: "0px !important",
      },
      "& .MuiAutocomplete-root": {
         minHeight: "50px",
         display: "flex",
         alignItems: "center",
      },
   },
})
const CustomToolbar = () => {
   const { title, converterFn, results } = useUserDataTable()

   const {
      exportingUsers,
      csvDownloadData,
      handleExportUsers,
      handleCloseCsvDialog,
   } = useExportUsers(results.fullQuery, converterFn, title)

   return (
      <>
         <Stack
            direction={{
               xs: "column",
               md: "row",
            }}
            spacing={3}
            alignItems={{
               md: "center",
            }}
            sx={styles.root}
         >
            <Card sx={styles.filters}>
               <Grid container spacing={2}>
                  <Grid item xs={12} md={6} lg={3}>
                     <CountriesSelect />
                  </Grid>
                  <Grid item xs={12} md={6} lg={4}>
                     <UniversitySelect />
                  </Grid>
                  <Grid item xs={12} md={6} lg={3}>
                     <FieldOfStudySelect />
                  </Grid>
                  <Grid item xs={12} md={6} lg={2}>
                     <LevelOfStudySelect />
                  </Grid>
               </Grid>
            </Card>
            <LoadingButton
               loading={exportingUsers}
               onClick={handleExportUsers}
               disabled={results.countQueryResponse?.count === 0}
               variant="outlined"
               color="secondary"
               size="large"
            >
               EXPORT POOL
            </LoadingButton>
         </Stack>
         {csvDownloadData ? (
            <CSVDialogDownload
               title={csvDownloadData.title}
               data={csvDownloadData.data}
               filename={`${title}.csv`}
               defaultOpen={!!csvDownloadData}
               onClose={handleCloseCsvDialog}
            />
         ) : null}
      </>
   )
}

export default CustomToolbar
