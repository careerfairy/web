import React, { useMemo, useState } from "react"
import { copyStringToClipboard } from "../helperFunctions/HelperFunctions"
import { useDispatch } from "react-redux"
import * as actions from "../../store/actions"
import { tableIcons } from "../util/tableUtils"
import { universityCountriesMap } from "../util/constants/universityCountries"
import LinkifyText from "../util/LinkifyText"

const columns = () => [
   {
      field: "firstName",
      title: "First Name",
   },
   {
      field: "lastName",
      title: "Last Name",
   },
   {
      field: "university.name",
      title: "University",
   },
   {
      field: "unsubscribed",
      title: "Has Unsubscribed From Newsletter",
      type: "boolean",
   },
   {
      field: "universityCountryCode",
      title: "University Country",
      lookup: universityCountriesMap,
   },
   {
      field: "userEmail",
      title: "Email",
      render: ({ id }) => <a href={`mailto:${id}`}>{id}</a>,
      cellStyle: {
         width: 300,
      },
   },
   {
      field: "linkedinUrl",
      title: "LinkedIn",
      render: ({ linkedinUrl }) => <LinkifyText>{linkedinUrl}</LinkifyText>,
   },
]

const useUserTable = () => {
   const dispatch = useDispatch()
   const [selection, setSelection] = useState([])

   const sendMessage = (message = "", type = "success") =>
      dispatch(
         actions.enqueueSnackbar({
            message: message,
            options: {
               variant: type,
               key: "Emails have been copied!",
            },
         })
      )

   const handlers = useMemo(
      () => ({
         handleCopyEmails: () => {
            const emails = selection.map((user) => user.id).join(";")
            copyStringToClipboard(emails)
            sendMessage("Emails have been copied!")
         },
         getEmails: () => {
            return selection.map((user) => user.id)
         },
         handleCopyLinkedin: () => {
            const linkedInAddresses = selection
               .filter((user) => user.linkedinUrl)
               .map((user) => user.linkedinUrl)
               .join(",")
            if (linkedInAddresses?.length) {
               copyStringToClipboard(linkedInAddresses)
               sendMessage("LinkedIn addresses have been copied!")
            } else {
               sendMessage(
                  "None of your selections have linkedIn Addresses",
                  "warning"
               )
            }
         },
      }),
      [selection]
   )

   const tableActions = useMemo(
      () => ({
         copyEmails: (rowData) => ({
            tooltip: !(rowData.length === 0) && "Copy Emails",
            position: "toolbarOnSelect",
            icon: tableIcons.AlternateEmailIcon,
            disabled: rowData.length === 0,
            onClick: handlers.handleCopyEmails,
         }),
         copyLinkedIn: (rowData) => ({
            tooltip: !(rowData.length === 0) && "Copy LinkedIn Addresses",
            position: "toolbarOnSelect",
            icon: tableIcons.LinkedInIcon,
            disabled: rowData.length === 0,
            onClick: handlers.handleCopyLinkedin,
         }),
      }),
      [handlers]
   )

   return { selection, setSelection, handlers, columns, tableActions }
}

export default useUserTable
