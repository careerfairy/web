import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {getMinutes, prettyDate} from "../../../../../helperFunctions/HelperFunctions";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import {Rating} from "@material-ui/lab";
import {Box, useTheme} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles(theme => ({
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
    },
    tableTooltipQuestion: {
        fontSize: theme.spacing(2)
    },
}));


export const getDate = (params) => {
    return prettyDate(params.value)
}
export const getCount = ({value}) => {
    return value ? value.length : 0
}
export const renderLongText = ({value}) => {
    return (
        <Tooltip title={
            <Typography style={{fontSize: "1.5rem"}}>
                {value}
            </Typography>
        }>
            <Typography variant="inherit" noWrap>
                {value}
            </Typography>
        </Tooltip>
    )
}


export const renderAppearAfter = ({value}) => {
    return (
        <Typography variant="inherit" noWrap>
            {getMinutes(value)}
        </Typography>
    )
}

export const RatingInputValue = ({item, applyValue}) => {
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

export const renderRating = ({value, row}) => {
    const theme = useTheme()
    return (
        <Box display="flex" alignItems="center">
            <Rating
                readOnly
                name={row.id}
                value={Number(value)}
                precision={0.5}
            />
            {value ?
                <Typography
                    style={{
                    marginLeft: theme.spacing(1),
                    color: theme.palette.text.secondary,
                    fontWeight: 500
                }}>
                    {value}
                </Typography> : null}
        </Box>
    )
}


export const filterModel = {
    items: [{columnField: 'rating', value: '3.5', operatorValue: '>='}],
};
