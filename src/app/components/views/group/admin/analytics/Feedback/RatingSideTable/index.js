import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Box, Button, Card, CardHeader, Divider, makeStyles} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {DataGrid, getNumericColumnOperators} from '@material-ui/data-grid';
import {withFirebase} from "../../../../../../../context/firebase";
import {copyStringToClipboard, prettyDate} from "../../../../../../helperFunctions/HelperFunctions";
import {CustomLoadingOverlay, CustomNoRowsOverlay} from "./Overlays";
import {useSnackbar} from "notistack";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import {Rating} from '@material-ui/lab';


const useStyles = makeStyles((theme) => ({
    root: {},
    actions: {
        justifyContent: 'flex-end'
    },
    tableTooltipQuestion: {
        fontSize: theme.spacing(2)
    },
    displayGraphButton: {
        fontWeight: 500,
        color: theme.palette.primary.main
    },
    ratingInput: {
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        paddingLeft: 20,
    },
    ratingText: {
        marginLeft: theme.spacing(1),
        color: theme.palette.text.secondary,
        fontWeight: 500
    }
}));

const getDate = (params) => {
    return prettyDate(params.value)
}
const getCount = ({value}) => {
    return value ? value.length : 0
}
const renderLongText = ({value}) => {
    const classes = useStyles()
    return (
        <Tooltip title={
            <Typography className={classes.tableTooltipQuestion}>
                {value}
            </Typography>
        }>
            <Typography variant="inherit" noWrap>
                {value}
            </Typography>
        </Tooltip>
    )
}
const renderAppearAfter = ({value}) => {
    return (
        <Typography variant="inherit" noWrap>
            {value} minutes
        </Typography>
    )
}

const RatingInputValue = ({item, applyValue}) => {
    const classes = useStyles();

    const handleFilterChange = (event) => {
        applyValue({...item, value: event.target.value});
    };

    return (
        <div className={classes.ratingInput}>
            <Rating
                name="custom-rating-filter-operator"
                placeholder="Filter value"
                value={Number(item.value)}
                onChange={handleFilterChange}
                precision={0.5}
            />
        </div>
    );
}

const renderRating = ({value, row}) => {
    const classes = useStyles()
    return (
        <Box display="flex" alignItems="center">
            <Rating
                readOnly
                name={row.id}
                value={Number(value)}
                precision={0.5}
            />
            <Typography className={classes.ratingText}>
                {value}
            </Typography>
        </Box>
    )
}


const filterModel = {
    items: [{columnField: 'rating', value: '3.5', operatorValue: '>='}],
};

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
