import React, {useMemo, useState} from 'react';
import {copyStringToClipboard} from "../helperFunctions/HelperFunctions";
import {useDispatch} from "react-redux";
import * as actions from '../../store/actions'
import {LinkifyText} from "../util/tableUtils";

const columns = [
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
        type: "boolean"
    },
    {
        field: "universityCountry",
        title: "University Country",
    },
    {
        field: "userEmail",
        title: "Email",
        render: ({id}) => (
            <a href={`mailto:${id}`}>
                {id}
            </a>
        ),
        cellStyle: {
            width: 300,
        },
    },
    {
        field: "linkedinUrl",
        title: "LinkedIn",
        render: (rowData) => LinkifyText(rowData.linkedinUrl),

    }
]

const useUserTable = () => {
    const dispatch = useDispatch()
    const [selection, setSelection] = useState([]);

    const sendMessage = (message = "", type = "success") => dispatch(actions.enqueueSnackbar({
        message: message,
        options: {
            variant: type,
            key: "Emails have been copied!"
        }
    }))

    const handlers = useMemo(() => ({
        handleCopyEmails: () => {
            const emails = selection.map(user => user.id).join(";")
            copyStringToClipboard(emails)
            sendMessage("Emails have been copied!")
        },

        handleCopyLinkedin: () => {
            const linkedInAddresses = selection.filter(user => user.linkedinUrl).map(user => user.linkedinUrl).join(",")
            if (linkedInAddresses?.length) {
                copyStringToClipboard(linkedInAddresses)
                sendMessage("LinkedIn addresses have been copied!")
            } else {
                sendMessage("None of your selections have linkedIn Addresses", "warning")
            }
        },
    }), [selection])

    return {selection, setSelection, handlers, columns}
}


export default useUserTable;