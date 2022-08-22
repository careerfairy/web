import React, { useCallback, useMemo, useState } from "react"
import { Card } from "@mui/material"
import { defaultTableOptions, tableIcons } from "../../../util/tableUtils"
import ExportTable from "../../common/Tables/ExportTable"
import { MaterialTableProps } from "@material-table/core"

import SendEmailTemplateDialog from "./SendEmailTemplateDialog/SendEmailTemplateDialog"
import { BigQueryUserResponse } from "@careerfairy/shared-lib/dist/bigQuery/types"
import { universityCountriesMap } from "../../../util/constants/universityCountries"
import LinkifyText from "../../../util/LinkifyText"
import {
   useFieldsOfStudy,
   useLevelsOfStudy,
} from "../../../custom-hook/useCollection"
import { BigQueryUserQueryOptions } from "@careerfairy/shared-lib/dist/bigQuery/types"

interface UserTableProps {
   users: BigQueryUserResponse[]
   pageSize: number
   loading: boolean
   title?: string
   handleSort: (
      orderBy: keyof BigQueryUserResponse,
      sortOrder: "DESC" | "ASC"
   ) => void
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

   const columns: MaterialTableProps<BigQueryUserResponse>["columns"] = useMemo(
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
            filterOnItemSelect: true,
         },
         {
            field: "fieldOfStudyId",
            title: "Field of study",
            lookup: fieldsOfStudyLookup,
         },
         {
            field: "levelOfStudyId",
            title: "Level of study",
            lookup: levelsOfStudyLookup,
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
            lookup: universityCountriesMap,
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
      [fieldsOfStudyLookup, levelsOfStudyLookup, universityCountriesMap]
   )

   const customTableOptions = useMemo(
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
   const handleCloseEmailTemplateDialog = () => setLocalQueryOptions(null)

   const actions: MaterialTableProps<BigQueryUserResponse>["actions"] = [
      {
         // @ts-ignore
         icon: tableIcons.EmailIcon,
         onClick: handleOpenEmailTemplateDialog,
         tooltip: "Email users",
         isFreeAction: true,
      },
   ]
   const onOrderChange = (
      columnIndex: number,
      columnSortOrder: "desc" | "asc"
   ) => {
      if (columnIndex <= -1) {
         return handleSort("firstName", "DESC")
      }
      const field = columns[
         columnIndex
      ].field.toString() as keyof BigQueryUserResponse
      handleSort(field, columnSortOrder.toUpperCase() as "DESC" | "ASC")
   }
   const onFilterChange: MaterialTableProps<BigQueryUserResponse>["onFilterChange"] =
      (filters) => {
         filters.forEach((filter) => {
            if (filter.column.field === "universityCountryCode") {
               setOptions((prev) => ({
                  ...prev,
                  universityCountryCodes: filter.value,
                  page: 0,
               }))
            }
            if (filter.column.field === "universityName") {
               setOptions((prev) => ({
                  ...prev,
                  universityName: filter.value,
                  page: 0,
               }))
            }
            if (filter.column.field === "fieldOfStudyId") {
               setOptions((prev) => ({
                  ...prev,
                  fieldOfStudyIds: filter.value,
                  page: 0,
               }))
            }
            if (filter.column.field === "levelOfStudyId") {
               setOptions((prev) => ({
                  ...prev,
                  levelOfStudyIds: filter.value,
                  page: 0,
               }))
            }
         })
      }

   return (
      <Card>
         <ExportTable
            icons={tableIcons}
            isLoading={loading || loadingFieldsOfStudy || loadingLevelsOfStudy}
            data={users}
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
