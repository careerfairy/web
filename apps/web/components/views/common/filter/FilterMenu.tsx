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
import ToggleSelector from "./selectors/ToggleSelector"
import useIsMobile from "components/custom-hook/useIsMobile"
import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"

const styles = sxStyles({
   paperRoot: {
      borderRadius: wishListBorderRadius,
      boxShadow: (theme) => theme.legacy.boxShadows.dark_12_13,
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
      py: 2,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "1px solid #EEEEEE",
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
   loadingButton: {
      width: "170px",
      maxHeight: "40px",
      textTransform: "none",
      fontSize: "15px",
   },
   clearButton: {
      textTransform: "none",
      fontSize: "15px",
      color: "#8E8E8E",
   },
   dialog: {
      mt: "73px",
      borderRadius: "10px",
   },
   paper: {
      borderTopLeftRadius: "15px",
      borderTopRightRadius: "15px",
   },
})

export type SortType = "dateAsc" | "dateDesc" | "upvotesAsc" | "upvotesDesc"

type Props = {
   open: boolean
   handleClose: () => void
}

const FilterMenu = ({ open, handleClose }: Props) => {
   const isMobile = useIsMobile()
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
         const options = mapOptions(selectedOption).map(encodeURIComponent)
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
            case FilterEnum.COMPANY_COUNTRIES:
               toShow = {
                  title: "Location",
                  renderFn: () => (
                     <CompanyCountrySelector
                        key={FilterEnum.COMPANY_COUNTRIES}
                        handleChange={handleChangeMultiSelect}
                     />
                  ),
               }
               break
            case FilterEnum.COMPANY_INDUSTRIES:
               toShow = {
                  title: "Industry",
                  renderFn: () => (
                     <CompanyIndustrySelector
                        key={FilterEnum.COMPANY_INDUSTRIES}
                        handleChange={handleChangeMultiSelect}
                     />
                  ),
               }
               break
            case FilterEnum.COMPANY_SIZES:
               toShow = {
                  title: "Company size",
                  renderFn: () => (
                     <CompanySizeSelector
                        key={FilterEnum.COMPANY_SIZES}
                        handleChange={handleChangeMultiSelect}
                     />
                  ),
               }
               break
            case FilterEnum.LANGUAGES:
               toShow = {
                  title: "Language",
                  renderFn: () => (
                     <LanguageSelector
                        key={FilterEnum.LANGUAGES}
                        handleChange={handleChangeMultiSelect}
                     />
                  ),
               }
               break
            case FilterEnum.FIELDS_OF_STUDY:
               toShow = {
                  title: "Field of study",
                  renderFn: () => (
                     <FieldsOfStudySelector
                        key={FilterEnum.FIELDS_OF_STUDY}
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
            case FilterEnum.COMPANY_ID:
               return <ActiveCompanyFilter key={FilterEnum.COMPANY_ID} />

            case FilterEnum.RECORDED_ONLY:
               return (
                  <RecordedOnlyToggle
                     key={FilterEnum.RECORDED_ONLY}
                     handleApplyFilter={handleApplyFilter}
                  />
               )
            case FilterEnum.COMPANY_SPARKS:
               return (
                  <ToggleSelector
                     key={FilterEnum.COMPANY_SPARKS}
                     handleApplyFilter={handleApplyFilter}
                     label="Sparks"
                     description="Show only companies with Sparks"
                     filterId={FilterEnum.COMPANY_SPARKS}
                  />
               )

            case FilterEnum.INTERESTS:
               return (
                  <InterestsSelector
                     key={FilterEnum.INTERESTS}
                     handleChange={handleChangeMultiSelect}
                  />
               )

            case FilterEnum.JOB_CHECK:
               return (
                  <JobCheck
                     key={FilterEnum.JOB_CHECK}
                     handleApplyFilter={handleApplyFilter}
                  />
               )

            case FilterEnum.SORT_BY:
               return (
                  <SortBySelector
                     key={FilterEnum.SORT_BY}
                     handleApplyFilter={handleApplyFilter}
                  />
               )

            case FilterEnum.LANGUAGES:
            case FilterEnum.COMPANY_COUNTRIES:
            case FilterEnum.COMPANY_INDUSTRIES:
            case FilterEnum.COMPANY_SIZES:
            case FilterEnum.FIELDS_OF_STUDY:
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
         fullScreen={isMobile}
         PaperProps={isMobile ? { sx: styles.paper } : undefined}
         sx={isMobile ? styles.dialog : undefined}
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
               size={"medium"}
               color={"secondary"}
               disabled={numberOfActiveFilters < 1}
               sx={styles.clearButton}
            >
               Clear filters
            </Button>
            <LoadingButton
               loading={
                  numberOfActiveFilters > 0 && numberOfResults === undefined
               }
               disabled={Boolean(!numberOfResults)}
               color="primary"
               variant={"contained"}
               size={"medium"}
               onClick={handleClose}
               sx={styles.loadingButton}
            >
               {numberOfActiveFilters > 0
                  ? `${numberOfResults} Results`
                  : `Apply filters`}
            </LoadingButton>
         </DialogActions>
      </Dialog>
   )
}

export default FilterMenu
