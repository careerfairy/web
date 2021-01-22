import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Card, CardHeader, makeStyles} from '@material-ui/core';
import {withFirebase} from "../../../../../../../context/firebase";
import {exportSelectionAction, renderRatingStars, StarRatingInputValue, tableIcons} from "../../common/TableUtils";
import MaterialTable from "material-table";
import {prettyDate} from "../../../../../../helperFunctions/HelperFunctions";


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
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const [data, setData] = useState([]);

    useEffect(() => {
        if (currentRating?.voters?.length) {
            setData(currentRating.voters)
        } else {
            setData([])
        }
    }, [currentRating])

    const active = () => {
        return Boolean(
            currentRating
        )
    }

    return (
        <Card
            raised={active()}
            ref={sideRef}
            className={clsx(classes.root, className)}
            {...rest}
        >
            <MaterialTable
                icons={tableIcons}
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
                options={{
                    filtering: true,
                    selection: true,
                    pageSize: 5,
                    pageSizeOptions: [5, 10, 25, 50, 100, 200],
                    exportButton: {csv: true, pdf: false}// PDF is false because its buggy and throws errors
                }}
                isLoading={fetchingStreams}
                actions={[(exportSelectionAction(columns))]}
                onSelectionChange={(rows) => {
                    setSelection(rows);
                }}
                title={
                    <CardHeader
                        title={`${streamDataType.displayName} Breakdown`}
                        subheader={currentRating?.question}
                    />
                }
            />
        </Card>
    );
};

RatingSideTable.propTypes = {
    className: PropTypes.string
};

export default withFirebase(RatingSideTable);
