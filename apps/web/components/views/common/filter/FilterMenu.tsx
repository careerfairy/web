import React, { useCallback, useMemo } from "react"
import {
   Button,
   Chip,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   FormControl,
   FormControlLabel,
   IconProps,
   SelectChangeEvent,
} from "@mui/material"
import Box from "@mui/material/Box"
import { wishListBorderRadius } from "../../../../constants/pages"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useRouter } from "next/router"
import { ResponsiveOption, ResponsiveSelect } from "../ResponsiveSelect"
import { useInterests } from "../../../custom-hook/useCollection"
import { sxStyles } from "../../../../types/commonTypes"
import firebase from "firebase/compat/app"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import DownIcon from "@mui/icons-material/ArrowDropDown"
import {
   CompanyCountryValues,
   CompanyIndustryValues,
   CompanySizesCodes,
   languageOptionCodes,
} from "../../../../constants/forms"
import {
   formatToOptionArray,
   mapOptions,
   multiListSelectMapValueFn,
} from "../../signup/utils"
import MultiListSelect from "../MultiListSelect"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import Checkbox from "@mui/material/Checkbox"
import { FilterEnum, useFilter } from "./Filter"
import { Transition } from "../../credits-dialog/CreditsDialog"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTheme } from "@mui/material/styles"
import MultiCheckboxSelect from "../MultiCheckboxSelect"

const UpIcon = (props: IconProps) => (
   // @ts-ignore
   <DownIcon {...props} style={{ transform: "rotate(180deg)" }} />
)

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

export const getFirebaseSortType = (
   sortType: SortType
): [
   Wish["numberOfUpvotes"] | Wish["createdAt"],
   firebase.firestore.OrderByDirection
] => {
   switch (sortType) {
      case "dateAsc":
         // @ts-ignore
         return ["createdAt", "asc"]
      case "dateDesc":
         // @ts-ignore
         return ["createdAt", "desc"]
      case "upvotesAsc":
         // @ts-ignore
         return ["numberOfUpvotes", "asc"]
      case "upvotesDesc":
         // @ts-ignore
         return ["numberOfUpvotes", "desc"]
      default:
         // @ts-ignore
         return ["createdAt", "desc"]
   }
}

interface SelectProps {
   id: string
   labelId: string
   value: SortType
   label: string
   handleChange: (event: SelectChangeEvent<string>) => void
   options: { value: SortType; label: string; descending: boolean }[]
}

type Props = {
   open: boolean
   handleClose: () => void
}

const FilterMenu = ({ open, handleClose }: Props) => {
   const { data: interests } = useInterests()
   const { pathname, push, query } = useRouter()
   const { filtersToShow, numberOfResults } = useFilter()

   const mappedCompanySizesCodes = useMemo(
      (): OptionGroup[] =>
         CompanySizesCodes.map((size) => ({ id: size.id, name: size.label })),
      []
   )

   const handleQuery = useCallback(
      (queryParam: string, queryValue: string | string[]) => {
         const newQuery = {
            ...query,
            [queryParam]: Array.isArray(queryValue)
               ? queryValue.join(",")
               : queryValue,
            page: 0,
         }
         void push(
            {
               pathname: pathname,
               query: newQuery,
            },
            undefined,
            { shallow: true }
         )
      },
      [pathname, push, query]
   )

   const selects = useMemo<SelectProps[]>(
      () => [
         {
            id: "sort-select",
            labelId: "sort-select-label",
            // @ts-ignore
            value: Array.isArray(query.sortType)
               ? query.sortType[0]
               : query.sortType,
            label: "Sort by",
            handleChange: (event) => {
               handleQuery("sortType", event.target.value)
            },
            options: [
               {
                  value: "dateDesc",
                  label: "Date Descending (Newest First)",
                  descending: true,
               },
               {
                  value: "dateAsc",
                  label: "Date Ascending (Oldest First)",
                  descending: false,
               },
               {
                  value: "upvotesDesc",
                  label: "Upvotes Descending (Most Upvoted First)",
                  descending: true,
               },
               {
                  value: "upvotesAsc",
                  label: "Upvotes Ascending (Least Upvoted First)",
                  descending: false,
               },
            ],
         },
      ],
      [handleQuery, query.sortType]
   )

   const numberOfActiveFilters = useMemo(
      () =>
         [
            query.interests,
            query.sortType,
            query.languages,
            query.jobCheck,
            query.companyCountries,
            query.companySizes,
            query.companyIndustries,
         ].filter((value) => value).length,
      [query]
   )

   const handleClickInterest = useCallback(
      (interestName: string) => {
         const currentInterests = Array.isArray(query.interests)
            ? query.interests
            : query.interests?.split(",") || []
         const isInQuery = currentInterests.includes(interestName)

         const newInterests = isInQuery
            ? currentInterests
                 .filter((interest) => interest !== interestName)
                 .join(",")
            : currentInterests.concat(interestName).join(",")

         const newQuery = {
            ...query,
            interests: newInterests,
            page: 0,
         }

         // if there´s no filter, no need to have an empty query param
         if (newInterests.length === 0) {
            delete newQuery.interests
         }

         void push(
            {
               pathname: pathname,
               query: newQuery,
            },
            undefined,
            { shallow: true }
         )
      },
      [pathname, push, query]
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

         void push(
            {
               pathname: pathname,
               query: newQuery,
            },
            undefined,
            { shallow: true }
         )
      },
      [pathname, push, query]
   )

   const handleJobCheck = useCallback(
      (event) => {
         const checked = event.target.checked

         const newQuery = {
            ...query,
            ["jobCheck"]: checked,
            page: 0,
         }

         // if job check is false we don't want the filter to be applied
         // no jobCheck = false on the url
         if (!checked) {
            delete newQuery?.["jobCheck"]
         }

         void push(
            {
               pathname: pathname,
               query: newQuery,
            },
            undefined,
            { shallow: true }
         )
      },
      [pathname, push, query]
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

   const isSelected = useCallback(
      (interestId) => query.interests?.includes(interestId),
      [query.interests]
   )

   const isJobChecked = useCallback(
      () => query?.jobCheck === "true",
      [query.jobCheck]
   )

   const getSelectedLanguages = useCallback(() => {
      const queryLanguages = query.languages as string
      let selectedLanguages = []

      if (queryLanguages) {
         selectedLanguages = formatToOptionArray(
            queryLanguages.split(","),
            languageOptionCodes
         )
      }
      return selectedLanguages
   }, [query.languages])

   const getSelectedCompanyIndustry = useCallback(() => {
      const queryIndustries = query.companyIndustries as string
      let selectedIndustries = []

      if (queryIndustries) {
         selectedIndustries = formatToOptionArray(
            queryIndustries.split(","),
            CompanyIndustryValues
         )
      }
      return selectedIndustries
   }, [query.companyIndustries])

   const getSelectedCompanyCountry = useCallback((): OptionGroup[] => {
      const queryCompanyCountry = query.companyCountries as string
      let selectedCountry = []

      if (queryCompanyCountry) {
         selectedCountry = formatToOptionArray(
            queryCompanyCountry.split(","),
            CompanyCountryValues
         )
      }
      return selectedCountry
   }, [query.companyCountries])

   const getSelectedCompanySize = useCallback((): OptionGroup[] => {
      const queryCompanySize = query.companySizes as string
      let selectedSize = []

      if (queryCompanySize) {
         selectedSize = formatToOptionArray(
            queryCompanySize.split(","),
            mappedCompanySizesCodes
         )
      }
      return selectedSize
   }, [mappedCompanySizesCodes, query.companySizes])

   const renderSortBy = useCallback((): JSX.Element => {
      return (
         <div key="sort-select">
            {selects.map((select) => (
               <FormControl key={select.id} variant={"outlined"} fullWidth>
                  <Stack
                     direction={"row"}
                     justifyContent={"space-between"}
                     alignItems={"center"}
                     spacing={2}
                     sx={{ mb: 1, height: "35px" }}
                  >
                     <Typography
                        htmlFor={select.id}
                        component={"label"}
                        variant={"h6"}
                        id={select.labelId}
                     >
                        {select.label}
                     </Typography>
                  </Stack>

                  <ResponsiveSelect
                     labelId={select.labelId}
                     id={select.id}
                     displayEmpty
                     value={select.value || ""}
                     onChange={select.handleChange}
                  >
                     <ResponsiveOption disabled value="">
                        Select an option
                     </ResponsiveOption>
                     {select.options.map((option) => (
                        <ResponsiveOption
                           key={option.value}
                           value={option.value}
                           icon={option.descending ? <DownIcon /> : <UpIcon />}
                        >
                           {option.label}
                        </ResponsiveOption>
                     ))}
                  </ResponsiveSelect>
               </FormControl>
            ))}
         </div>
      )
   }, [selects])

   const renderLanguagesSelect = useCallback(() => {
      return (
         <MultiCheckboxSelect
            inputName={"languages"}
            selectedItems={getSelectedLanguages()}
            allValues={languageOptionCodes}
            setFieldValue={handleChangeMultiSelect}
            getValueFn={multiListSelectMapValueFn}
         />
      )
   }, [getSelectedLanguages, handleChangeMultiSelect])

   const renderInterests = useCallback(() => {
      if (interests.length > 0) {
         return (
            <FormControl key="tags-select" variant={"outlined"} fullWidth>
               <Typography
                  htmlFor="tags-select"
                  component={"label"}
                  variant={"h6"}
                  id={"tags-select-label"}
               >
                  {"Tags"}
               </Typography>
               <Box id={"tags-select"}>
                  {interests.map((interest) => (
                     <Chip
                        sx={styles.interestChip}
                        onClick={() => handleClickInterest(interest.id)}
                        color={isSelected(interest.id) ? "primary" : "default"}
                        /*
                           // @ts-ignore */
                        variant={
                           isSelected(interest.id) ? "contained" : "outlined"
                        }
                        stacked={"true"}
                        label={interest.name}
                        key={interest.id}
                     />
                  ))}
               </Box>
            </FormControl>
         )
      }
   }, [handleClickInterest, interests, isSelected])

   const renderJobCheck = useCallback(() => {
      return (
         <FormControlLabel
            key="job-check"
            control={
               <Checkbox
                  // @ts-ignore
                  size="large"
                  sx={{ pl: 0 }}
                  checked={isJobChecked()}
                  onChange={handleJobCheck}
               />
            }
            label="Job opening available"
         />
      )
   }, [handleJobCheck, isJobChecked])

   const renderCompanyCountrySelect = useCallback(() => {
      return (
         <MultiListSelect
            inputName={"companyCountries"}
            isCheckbox
            selectedItems={getSelectedCompanyCountry()}
            allValues={CompanyCountryValues}
            setFieldValue={handleChangeMultiSelect}
            inputProps={{
               placeholder: "Select company location",
            }}
            getValueFn={multiListSelectMapValueFn}
            chipProps={{
               color: "primary",
            }}
         />
      )
   }, [getSelectedCompanyCountry, handleChangeMultiSelect])

   const renderCompanyIndustrySelect = useCallback(() => {
      return (
         <MultiListSelect
            inputName={"companyIndustries"}
            isCheckbox
            selectedItems={getSelectedCompanyIndustry()}
            allValues={CompanyIndustryValues}
            setFieldValue={handleChangeMultiSelect}
            inputProps={{
               placeholder: "Select company industry",
            }}
            getValueFn={multiListSelectMapValueFn}
            chipProps={{
               color: "primary",
            }}
         />
      )
   }, [getSelectedCompanyIndustry, handleChangeMultiSelect])

   const renderCompanySizeSelect = useCallback(() => {
      return (
         <MultiListSelect
            inputName={"companySizes"}
            isCheckbox
            selectedItems={getSelectedCompanySize()}
            allValues={mappedCompanySizesCodes}
            setFieldValue={handleChangeMultiSelect}
            inputProps={{
               placeholder: "Select company size",
            }}
            getValueFn={multiListSelectMapValueFn}
            chipProps={{
               color: "primary",
            }}
         />
      )
   }, [
      getSelectedCompanySize,
      handleChangeMultiSelect,
      mappedCompanySizesCodes,
   ])

   const renderAutoCompleteFilter = useCallback(
      (filter: FilterEnum) => {
         let toShow: {
            title: string
            renderFn: () => JSX.Element
         }

         switch (filter) {
            case FilterEnum.companyCountries:
               toShow = {
                  title: "Company Country",
                  renderFn: renderCompanyCountrySelect,
               }
               break
            case FilterEnum.companyIndustries:
               toShow = {
                  title: "Company Industry",
                  renderFn: renderCompanyIndustrySelect,
               }
               break
            case FilterEnum.companySizes:
               toShow = {
                  title: "Company Size",
                  renderFn: renderCompanySizeSelect,
               }
               break
            case FilterEnum.languages:
               toShow = {
                  title: "Languages",
                  renderFn: renderLanguagesSelect,
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
      [
         renderCompanyCountrySelect,
         renderCompanyIndustrySelect,
         renderCompanySizeSelect,
         renderLanguagesSelect,
      ]
   )

   const renderRecordedOnly = useCallback(() => {
      return <div key={"cenas"}>Rendered Only filter</div>
   }, [])

   const renderFilters = useCallback(
      (filter: FilterEnum): JSX.Element => {
         switch (filter) {
            case FilterEnum.recordedOnly:
               return renderRecordedOnly()

            case FilterEnum.interests:
               return renderInterests()

            case FilterEnum.jobCheck:
               return renderJobCheck()

            case FilterEnum.sortBy:
               return renderSortBy()

            case FilterEnum.languages:
            case FilterEnum.companyCountries:
            case FilterEnum.companyIndustries:
            case FilterEnum.companySizes:
               return renderAutoCompleteFilter(filter)
         }
      },
      [
         renderAutoCompleteFilter,
         renderInterests,
         renderJobCheck,
         renderRecordedOnly,
         renderSortBy,
      ]
   )
   const theme = useTheme()

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         maxWidth={"md"}
         fullWidth
         TransitionComponent={Transition}
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
            <Stack sx={styles.content} spacing={2}>
               {filtersToShow.map((filter) => renderFilters(filter))}
            </Stack>
         </DialogContent>

         <DialogActions sx={styles.actions}>
            <Button
               onClick={handleClearQueries}
               variant={"text"}
               size={"small"}
               sx={{
                  color:
                     numberOfActiveFilters > 0
                        ? theme.palette.secondary.main
                        : "text.secondary",
               }}
            >
               Clear filters
            </Button>
            <LoadingButton
               loading={numberOfActiveFilters > 0 && !numberOfResults}
               color="primary"
               variant={"contained"}
               size={"small"}
               onClick={handleClose}
               sx={{ maxWidth: "120px", maxHeight: "40px" }}
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
