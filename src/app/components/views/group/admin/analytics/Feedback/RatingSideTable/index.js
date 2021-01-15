import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Box, Button, Card, CardHeader, Divider, makeStyles} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {DataGrid, getNumericColumnOperators} from '@material-ui/data-grid';
import {withFirebase} from "../../../../../../../context/firebase";
import {CustomLoadingOverlay, CustomNoRowsOverlay} from "./Overlays";
import {filterModel, getDate, RatingInputValue, renderRating} from "../../common/TableUtils";


const useStyles = makeStyles((theme) => ({
    root: {},
    actions: {
        justifyContent: 'flex-end'
    },
    tableTooltipQuestion: {
        fontSize: theme.spacing(2)
    },
}));


const initialColumns = [
    {
        field: "rating",
        headerName: "Rating",
        width: 160,
        renderCell: renderRating,
        filterOperators: getNumericColumnOperators().map((operator) => ({
            ...operator,
            InputComponent: RatingInputValue,
        }))
    },
    {
        field: "timestamp",
        headerName: "Voted On",
        width: 200,
        valueGetter: getDate,
    },
    {
        field: "message",
        headerName: "Message",
        width: 250,
    },
]

const RatingSideTable = ({
                             currentRating,
                             streamDataType,
                             fetchingStreams,
                             className,
                             ...rest
                         }) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const [data, setData] = useState([]);
    const [expandTable, setExpandTable] = useState(false);

    useEffect(() => {
        if (currentRating) {
            setData(currentRating.voters)
        } else {
            setData([])
        }
    }, [currentRating])

    const toggleTable = () => {
        setExpandTable(!expandTable)
    }

    const newData = {
        columns: initialColumns,
        rows: data
    }

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardHeader
                title={`${streamDataType.displayName} Breakdown`}
                subheader={currentRating?.question}
            />
            <Divider/>
            <Box height={expandTable ? 800 : 500} width="100%">
                <DataGrid
                    {...newData}
                    filterModel={filterModel}
                    loading={fetchingStreams}
                    onSelectionChange={(newSelection) => {
                        setSelection(newSelection.rowIds);
                    }}
                    components={{
                        noRowsOverlay: CustomNoRowsOverlay,
                        loadingOverlay: CustomLoadingOverlay,
                    }}
                />
            </Box>
            <Box
                display="flex"
                justifyContent="space-between"
                p={2}
            >
                <Button
                    color="primary"
                    onClick={toggleTable}
                    endIcon={!expandTable && <ArrowRightIcon/>}
                    size="small"
                    variant="text"
                >
                    {expandTable ? "Show Less" : "Expand"}
                </Button>
            </Box>
        </Card>
    );
};

RatingSideTable.propTypes = {
    className: PropTypes.string
};

export default withFirebase(RatingSideTable);
