import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Card, makeStyles, useTheme} from '@material-ui/core';
import {withFirebase} from "../../../../../../../context/firebase";
import {
    defaultTableOptions,
    exportSelectionAction,
    renderRatingStars,
    StarRatingInputValue,
    tableIcons
} from "../../common/TableUtils";
import MaterialTable from "material-table";
import {prettyDate} from "../../../../../../helperFunctions/HelperFunctions";
import {fade} from "@material-ui/core/styles";


const useStyles = makeStyles((theme) => ({
    root: {
        padding: 0
    },
    actions: {
        justifyContent: 'flex-end'
    },
    tableTooltipQuestion: {
        fontSize: theme.spacing(2)
    },
}));


const columns = [
    {
        field: "rating",
        title: "Rating",
        width: 160,
        render: renderRatingStars,
        filterComponent: StarRatingInputValue,
        customFilterAndSearch: (term, rowData) => Number(term) >= Number(rowData.rating)
    },
    {
        field: "date",
        title: "Voted",
        width: 200,
        render: (rowData) => prettyDate(rowData.timestamp),
        type: 'date'
    },
    {
        field: "message",
        title: "Message",
        width: 250,
    },
]

const RatingSideTable = ({
                             currentRating,
                             streamDataType,
                             fetchingStreams,
                             sideRef,
                             className,
                             ...rest
                         }) => {
    const dataTableRef = useRef(null)

    const theme = useTheme()
    const classes = useStyles();
    const [data, setData] = useState([]);

    useEffect(() => {
        if (currentRating?.voters?.length) {
            setData(currentRating.voters)
        } else {
            setData([])
        }
    }, [currentRating])

    useEffect(() => {
        if (dataTableRef.current) {
            dataTableRef.current.onAllSelected(false)
        }
    }, [currentRating?.id])
    const active = () => {
        return Boolean(
            currentRating
        )
    }

    const customOptions = {...defaultTableOptions}
    const innerTableStyle = {background: fade(theme.palette.navyBlue.main, 0.05)}
    customOptions.selection = false
    customOptions.pageSize = 3
    customOptions.headerStyle = innerTableStyle
    customOptions.exportButton.pdf = true

    return (
        <Card
            raised={active()}
            ref={sideRef}
            className={clsx(classes.root, className)}
            {...rest}
        >
            <MaterialTable
                icons={tableIcons}
                tableRef={dataTableRef}
                columns={[
                    {
                        field: "rating",
                        title: "Rating",
                        width: 160,
                        render: renderRatingStars,
                        filterComponent: StarRatingInputValue,
                        customFilterAndSearch: (term, rowData) => Number(term) >= Number(rowData.rating)
                    },
                    {
                        field: "date",
                        title: "Voted",
                        width: 200,
                        render: (rowData) => prettyDate(rowData.timestamp),
                        type: 'date'
                    },
                    {
                        field: "message",
                        title: "Message",
                        width: 250,
                    },
                ]}
                data={data}
                options={customOptions}
                isLoading={fetchingStreams}
                actions={[(exportSelectionAction(columns))]}

                title={currentRating?.question}
            />
        </Card>
    );
};

RatingSideTable.propTypes = {
    className: PropTypes.string
};

export default withFirebase(RatingSideTable);
