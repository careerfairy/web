import React, { useCallback } from "react"
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Divider,
   FormControl,
} from "@mui/material"
import Box from "@mui/material/Box"
import { wishListBorderRadius } from "../../../../constants/pages"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useRouter } from "next/router"
import { sxStyles } from "../../../../types/commonTypes"
import { mapOptions } from "../../signup/utils"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import { FilterEnum, useFilter } from "./Filter"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import LoadingButton from "@mui/lab/LoadingButton"
import JobCheck from "./selectors/JobCheck"
import RecordedOnlyToggle from "./selectors/RecordedOnlyToggle"
import SortBySelector from "./selectors/SortBySelector"
import InterestsSelector from "./selectors/InterestsSelector"
import CompanyCountrySelector from "./selectors/CompanyCountrySelector"
import CompanyIndustrySelector from "./selectors/CompanyIndustrySelector"
import CompanySizeSelector from "./selectors/CompanySizeSelector"
import LanguageSelector from "./selectors/LanguageSelector"
import FieldsOfStudySelector from "./selectors/FiledsOfStudySelector"
import { SlideUpTransition } from "../transitions"
import ActiveCompanyFilter from "./selectors/ActiveCompanyFilter"

const styles = sxStyles({
   paperRoot: {
      borderRadius: wishListBorderRadius,
      boxShadow: (theme) => theme.boxShadows.dark_12_13,
   },
   content: {
      p: { xs: 1, md: 2 },
      minWidth: 200,
   },
   header: {
      px: { xs: 2, md: 4 },
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   actions: {
      px: { xs: 2, md: 4 },
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   interestChip: {
      borderRadius: 1,
   },
   swipeableViews: {
      height: "100%",
   },
   swipeableViewsContainer: {
      height: "100%",
      "& > *": {
         height: "100%",
      },
   },
})

export type SortType = "dateAsc" | "dateDesc" | "upvotesAsc" | "upvotesDesc"

type Props = {
   open: boolean
   handleClose: () => void
}

const FilterMenu = ({ open, handleClose }: Props) => {
   const { pathname, push, query } = useRouter()
   const { filtersToShow, numberOfResults, numberOfActiveFilters } = useFilter()

   const handleApplyFilter = useCallback(
      ({ pathName, query }) => {
         void push(
            {
               pathname: pathName,
               query,
            },
            undefined,
            { shallow: true }
         )
      },
      [push]
   )

   const handleChangeMultiSelect = useCallback(
      (name: string, selectedOption: OptionGroup[]) => {
         const options = mapOptions(selectedOption)

         const newOptions = options.join(",")

         const newQuery = {
            ...query,
            [name]: newOptions,
            page: 0,
         }
         // if there´s no filter, no need to have an empty query param
         if (newOptions.length === 0) {
            delete newQuery[name]
         }

         handleApplyFilter({ pathName: pathname, query: newQuery })
      },
      [handleApplyFilter, pathname, query]
   )

   const handleClearQueries = useCallback(() => {
      const newQuery = { ...query }
      /**
       * We must only delete the query params that are being used as filters,
       * if not we could break some pages that use the query params for their slug
       * */
      filtersToShow.forEach((filter) => {
         delete newQuery[filter]
      })

      // Always reset the page to 0
      delete newQuery.page

      return push({ pathname, query: newQuery }, undefined, { shallow: true })
   }, [pathname, push, filtersToShow, query])

   const renderAutoCompleteFilter = useCallback(
      (filter: FilterEnum) => {
         let toShow: {
            title: string
            renderFn: () => JSX.Element
         }

         switch (filter) {
            case FilterEnum.companyCountries:
               toShow = {
                  title: "Country",
                  renderFn: () => (
                     <CompanyCountrySelector
                        key={FilterEnum.companyCountries}
                        handleChange={handleChangeMultiSelect}
                     />
                  ),
               }
               break
            case FilterEnum.companyIndustries:
               toShow = {
                  title: "Industry",
                  renderFn: () => (
                     <CompanyIndustrySelector
                        key={FilterEnum.companyIndustries}
                        handleChange={handleChangeMultiSelect}
                     />
                  ),
               }
               break
            case FilterEnum.companySizes:
               toShow = {
                  title: "Company Size",
                  renderFn: () => (
                     <CompanySizeSelector
                        key={FilterEnum.companySizes}
                        handleChange={handleChangeMultiSelect}
                     />
                  ),
               }
               break
            case FilterEnum.languages:
               toShow = {
                  title: "Language",
                  renderFn: () => (
                     <LanguageSelector
                        key={FilterEnum.languages}
                        handleChange={handleChangeMultiSelect}
                     />
                  ),
               }
               break
            case FilterEnum.fieldsOfStudy:
               toShow = {
                  title: "Field of study",
                  renderFn: () => (
                     <FieldsOfStudySelector
                        key={FilterEnum.fieldsOfStudy}
                        handleChange={handleChangeMultiSelect}
                     />
                  ),
               }
               break
         }

         if (!toShow?.title) {
            return null
         }

         return (
            <FormControl
               key={`${toShow.title}-select`}
               variant={"outlined"}
               fullWidth
            >
               <Stack
                  direction={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  spacing={2}
                  sx={{ height: "35px" }}
               >
                  <Typography
                     htmlFor={`${toShow.title}-select`}
                     component={"label"}
                     variant={"h5"}
                     fontWeight={600}
                     id={`${toShow.title}-select-label`}
                  >
                     {toShow.title}
                  </Typography>
               </Stack>
               <Box id={`${toShow.title}-select`} mt={1}>
                  {toShow.renderFn()}
               </Box>
            </FormControl>
         )
      },
      [handleChangeMultiSelect]
   )

   const renderFilters = useCallback(
      (filter: FilterEnum): JSX.Element => {
         switch (filter) {
            case FilterEnum.companyId:
               return <ActiveCompanyFilter key={FilterEnum.companyId} />

            case FilterEnum.recordedOnly:
               return (
                  <RecordedOnlyToggle
                     key={FilterEnum.recordedOnly}
                     handleApplyFilter={handleApplyFilter}
                  />
               )

            case FilterEnum.interests:
               return (
                  <InterestsSelector
                     key={FilterEnum.interests}
                     handleChange={handleChangeMultiSelect}
                  />
               )

            case FilterEnum.jobCheck:
               return (
                  <JobCheck
                     key={FilterEnum.jobCheck}
                     handleApplyFilter={handleApplyFilter}
                  />
               )

            case FilterEnum.sortBy:
               return (
                  <SortBySelector
                     key={FilterEnum.sortBy}
                     handleApplyFilter={handleApplyFilter}
                  />
               )

            case FilterEnum.languages:
            case FilterEnum.companyCountries:
            case FilterEnum.companyIndustries:
            case FilterEnum.companySizes:
            case FilterEnum.fieldsOfStudy:
               return renderAutoCompleteFilter(filter)
         }
      },
      [handleApplyFilter, handleChangeMultiSelect, renderAutoCompleteFilter]
   )

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         maxWidth={"md"}
         fullWidth
         TransitionComponent={SlideUpTransition}
         keepMounted={false} // Does not mount the children when dialog is closed
      >
         <DialogTitle sx={styles.header}>
            <Typography fontWeight={600} fontSize={"24px"}>
               Filters
            </Typography>
            <IconButton onClick={handleClose}>
               <CloseIcon
                  fontSize="large"
                  color={"inherit"}
                  sx={{ color: "text.primary" }}
               />
            </IconButton>
         </DialogTitle>

         <DialogContent sx={styles.content}>
            <Stack sx={styles.content} spacing={3} divider={<Divider />}>
               {filtersToShow.map((filter) => renderFilters(filter))}
            </Stack>
         </DialogContent>

         <DialogActions sx={styles.actions}>
            <Button
               onClick={handleClearQueries}
               variant={"text"}
               size={"small"}
               color={"secondary"}
               disabled={numberOfActiveFilters < 1}
            >
               Clear filters
            </Button>
            <LoadingButton
               loading={
                  numberOfActiveFilters > 0 && numberOfResults === undefined
               }
               color="primary"
               variant={"contained"}
               size={"small"}
               onClick={handleClose}
               sx={{ width: "130px", maxHeight: "40px" }}
            >
               {numberOfActiveFilters > 0
                  ? `${numberOfResults} Results`
                  : "All results"}
            </LoadingButton>
         </DialogActions>
      </Dialog>
   )
}

export default FilterMenu
