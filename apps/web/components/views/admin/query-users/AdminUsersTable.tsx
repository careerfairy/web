import React, { useCallback, useMemo, useState } from "react"
import { Card, LinearProgress } from "@mui/material"
import { defaultTableOptions, tableIcons } from "../../../util/tableUtils"
import MaterialTable, {
   MaterialTableProps,
   Options,
} from "@material-table/core"

import SendEmailTemplateDialog from "./SendEmailTemplateDialog/SendEmailTemplateDialog"
import { BigQueryUserQueryOptions } from "@careerfairy/shared-lib/bigQuery/types"
import LinkifyText from "../../../util/LinkifyText"
import {
   useFieldsOfStudy,
   useLevelsOfStudy,
   useUniversityCountries,
} from "../../../custom-hook/useCollection"
import { universityCountriesMap } from "../../../util/constants/universityCountries"
import { University } from "@careerfairy/shared-lib/universities"
import UniversityCountriesFilter from "./UniversityCountriesFilter"
import UniversitiesFilter from "./UniversitiesFilter"
import GenericFilterSelector from "./GenericFilterSelector"
import {
   countriesOptionCodes,
   maxCountriesOfInterestToShow,
} from "../../../../constants/forms"
import { UserRecord } from "./useUserRecords"

interface UserTableProps {
   users: UserRecord[]
   pageSize: number
   loading: boolean
   title?: string
   handleSort: (orderBy: keyof UserRecord, sortOrder: "DESC" | "ASC") => void
   setOptions: React.Dispatch<React.SetStateAction<BigQueryUserQueryOptions>>
   queryOptions: BigQueryUserQueryOptions
}

const AdminUsersTable = ({
   users = [],
   pageSize,
   loading,
   title = "Users",
   handleSort,
   setOptions,
   queryOptions,
}: UserTableProps) => {
   const [localQueryOptions, setLocalQueryOptions] =
      useState<BigQueryUserQueryOptions>(null)
   const { isLoading: loadingFieldsOfStudy, data: allFieldsOfStudy } =
      useFieldsOfStudy()
   const { isLoading: loadingLevelsOfStudy, data: allLevelsOfStudy } =
      useLevelsOfStudy()
   const { data: universityCountries, isLoading: loadingUniversityCountries } =
      useUniversityCountries()

   const universityCountriesLookup = useMemo(() => {
      return universityCountries.reduce((acc, universityCountry) => {
         acc[universityCountry.id] =
            universityCountriesMap[universityCountry.id] || universityCountry.id
         return acc
      }, {})
   }, [universityCountries])
   const { universityOptions, universityOptionsLookup } = useMemo(() => {
      let universityCountriesArray = [...universityCountries] // if no countries are selected, show all universities
      if (queryOptions.filters.universityCountryCodes.length > 0) {
         // if countries are selected, filter universities by country
         universityCountriesArray = universityCountries.filter(
            (universityCountry) =>
               queryOptions.filters.universityCountryCodes.includes(
                  universityCountry.id
               )
         )
      }
      const universityOptions = universityCountriesArray.reduce<University[]>(
         (acc, universityCountry) => {
            return acc.concat(universityCountry.universities)
         },
         []
      )
      const universityOptionsLookup = universityOptions.reduce(
         (acc, university) => {
            acc[university.id] = university.name
            return acc
         },
         {}
      )
      return { universityOptions, universityOptionsLookup }
   }, [universityCountries, queryOptions.filters.universityCountryCodes])

   const getCountryOfInterestToShow = useCallback(
      ({ countriesOfInterest: countryOfInterestIds }) => {
         if (countryOfInterestIds?.length > 0) {
            const countriesToShow = countriesOptionCodes.reduce((acc, curr) => {
               if (countryOfInterestIds.includes(curr.id)) {
                  acc.push(curr.name)
               }
               return acc
            }, [])

            // only show the first {maxCountriesOfInterestToShow} values, if there are more, it will show 3 points
            return `${countriesToShow
               .slice(0, maxCountriesOfInterestToShow)
               .join(", ")}${
               countryOfInterestIds?.length > maxCountriesOfInterestToShow
                  ? " ..."
                  : ""
            }`
         }

         return ""
      },
      []
   )

   const levelsOfStudyLookup = useMemo(() => {
      return allLevelsOfStudy?.reduce((acc, levelOfStudy) => {
         acc[levelOfStudy.id] = levelOfStudy.name
         return acc
      }, {})
   }, [allLevelsOfStudy])

   const fieldsOfStudyLookup = useMemo(() => {
      return allFieldsOfStudy?.reduce((acc, fieldOfStudy) => {
         acc[fieldOfStudy.id] = fieldOfStudy.name
         return acc
      }, {})
   }, [allFieldsOfStudy])

   const columns: MaterialTableProps<UserRecord>["columns"] = useMemo(
      () => [
         {
            field: "firstName",
            title: "First Name",
            filtering: false,
         },
         {
            field: "lastName",
            title: "Last Name",
            filtering: false,
         },
         {
            field: "universityName",
            title: "University",
            filtering: false,
            cellStyle: {
               minWidth: 200,
            },
         },
         {
            field: "fieldOfStudyId",
            title: "Field of study",
            lookup: fieldsOfStudyLookup,
            filterComponent: () => {
               return (
                  <GenericFilterSelector
                     entries={allFieldsOfStudy}
                     fieldName={"fieldOfStudyIds"}
                     noOptionsText={"All Fields of Study"}
                     inputPlaceholderText={"Fields of Study"}
                     setOptions={setOptions}
                     queryOptions={queryOptions}
                  />
               )
            },
         },
         {
            field: "levelOfStudyId",
            title: "Level of study",
            lookup: levelsOfStudyLookup,
            filterComponent: () => {
               return (
                  <GenericFilterSelector
                     entries={allLevelsOfStudy}
                     fieldName={"levelOfStudyIds"}
                     noOptionsText={"All Level of Study"}
                     inputPlaceholderText={"Level of Study"}
                     setOptions={setOptions}
                     queryOptions={queryOptions}
                     sx={{ minWidth: 150 }}
                  />
               )
            },
         },
         {
            field: "unsubscribed",
            title: "Has Unsubscribed From Newsletter",
            type: "boolean",
            filtering: false,
            sorting: false,
            lookup: {
               false: false,
               true: true,
               "": false,
            },
         },
         {
            field: "universityCountryCode",
            title: "University Country",
            lookup: universityCountriesLookup,
            filterComponent: () => (
               <UniversityCountriesFilter
                  universityCountries={universityCountries}
                  setOptions={setOptions}
                  queryOptions={queryOptions}
                  universityCountriesLookup={universityCountriesLookup}
               />
            ),
         },
         {
            field: "universityCode",
            title: "University Code",
            lookup: universityOptionsLookup,
            filterComponent: () => {
               return (
                  <UniversitiesFilter
                     universityOptions={universityOptions}
                     setOptions={setOptions}
                     queryOptions={queryOptions}
                  />
               )
            },
         },
         {
            field: "countriesOfInterest",
            title: "Countries of Interest",
            render: getCountryOfInterestToShow,
            filterComponent: () => {
               return (
                  <GenericFilterSelector
                     entries={countriesOptionCodes}
                     fieldName={"countriesOfInterest"}
                     noOptionsText={"All Countries of Interest"}
                     inputPlaceholderText={"Countries of Interest"}
                     setOptions={setOptions}
                     queryOptions={queryOptions}
                     sx={{ minWidth: 200 }}
                  />
               )
            },
         },
         {
            field: "userEmail",
            title: "Email",
            filtering: false,

            render: ({ userEmail }) => (
               <a href={`mailto:${userEmail}`}>{userEmail}</a>
            ),
            cellStyle: {
               width: 300,
            },
         },
         {
            field: "linkedinUrl",
            title: "LinkedIn",
            filtering: false,
            render: (rowData) => (
               <LinkifyText>{rowData.linkedinUrl}</LinkifyText>
            ),
         },
      ],
      [
         allFieldsOfStudy,
         allLevelsOfStudy,
         fieldsOfStudyLookup,
         getCountryOfInterestToShow,
         levelsOfStudyLookup,
         queryOptions,
         setOptions,
         universityCountries,
         universityCountriesLookup,
         universityOptions,
         universityOptionsLookup,
      ]
   )

   const customTableOptions = useMemo<Options<UserRecord>>(
      () => ({
         ...defaultTableOptions,
         pageSize: pageSize || 10,
         paging: false,
         selection: false,
         search: false,
         padding: "dense",
      }),
      [pageSize]
   )

   const handleOpenEmailTemplateDialog = useCallback(
      () => setLocalQueryOptions(queryOptions),
      [queryOptions]
   )
   const handleCloseEmailTemplateDialog = useCallback(
      () => setLocalQueryOptions(null),
      []
   )

   const actions: MaterialTableProps<UserRecord>["actions"] = [
      {
         // @ts-ignore
         icon: tableIcons.EmailIcon,
         onClick: handleOpenEmailTemplateDialog,
         tooltip: "Email users",
         isFreeAction: true,
      },
   ]
   const onOrderChange = useCallback(
      (columnIndex: number, columnSortOrder: "desc" | "asc") => {
         if (columnIndex <= -1) {
            return handleSort("firstName", "DESC")
         }
         const field = columns[columnIndex].field.toString() as keyof UserRecord
         handleSort(field, columnSortOrder.toUpperCase() as "DESC" | "ASC")
      },
      [columns, handleSort]
   )
   const onFilterChange: MaterialTableProps<UserRecord>["onFilterChange"] =
      useCallback(
         (filters) => {
            filters.forEach((filter) => {
               if (filter.column.field === "fieldOfStudyId") {
                  setOptions((prev) => ({
                     ...prev,
                     filters: {
                        ...prev.filters,
                        fieldOfStudyIds: filter.value,
                     },
                     page: 0,
                  }))
               }
               if (filter.column.field === "levelOfStudyId") {
                  setOptions((prev) => ({
                     ...prev,
                     filters: {
                        ...prev.filters,
                        levelOfStudyIds: filter.value,
                     },
                     page: 0,
                  }))
               }
            })
         },
         [setOptions]
      )

   return (
      <Card>
         <MaterialTable
            icons={tableIcons}
            isLoading={
               loading ||
               loadingFieldsOfStudy ||
               loadingLevelsOfStudy ||
               loadingUniversityCountries
            }
            data={users}
            components={{
               OverlayLoading: () => <LinearProgress />,
            }}
            onOrderChange={onOrderChange}
            onFilterChange={onFilterChange}
            options={customTableOptions}
            columns={columns}
            actions={actions}
            title={title}
         />
         <SendEmailTemplateDialog
            onClose={handleCloseEmailTemplateDialog}
            open={Boolean(localQueryOptions)}
            queryOptions={localQueryOptions}
            totalUsers={users[0]?.totalHits || 0}
         />
      </Card>
   )
}

export default AdminUsersTable
