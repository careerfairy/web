import React, {forwardRef, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {getMinutes, prettyDate} from "../../../../../helperFunctions/HelperFunctions";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import {Rating} from "@material-ui/lab";
import {Box} from "@material-ui/core";
import {CsvBuilder} from "filefy";

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import EditIcon from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import InsertChartOutlinedIcon from '@material-ui/icons/InsertChartOutlined';
import InsertChartIcon from '@material-ui/icons/InsertChart';
import BallotIcon from '@material-ui/icons/Ballot';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import EmailIcon from '@material-ui/icons/Email';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';
import AddToPhotosIcon from '@material-ui/icons/AddToPhotos';
import SettingsIcon from '@material-ui/icons/Settings';
import VideoLibraryOutlinedIcon from '@material-ui/icons/VideoLibraryOutlined';
import LibraryAddOutlinedIcon from '@material-ui/icons/LibraryAddOutlined';
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';

import Linkify from "react-linkify";

export const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref}/>),
    ThemedAdd: forwardRef((props, ref) => <AddBox color="primary" {...props} ref={ref}/>),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref}/>),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref}/>),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref}/>),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref}/>),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref}/>),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref}/>),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref}/>),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref}/>),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref}/>),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref}/>),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref}/>),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref}/>),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref}/>),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref}/>),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref}/>),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref}/>),
    InsertChartIcon: forwardRef((props, ref) => <InsertChartIcon color="primary" {...props} ref={ref}/>),
    InsertChartOutlinedIcon: forwardRef((props, ref) => <InsertChartOutlinedIcon {...props} ref={ref}/>),
    BallotIcon: forwardRef((props, ref) => <BallotIcon {...props} ref={ref}/>),
    ArrowDownwardIcon: forwardRef((props, ref) => <ArrowDownwardIcon {...props} ref={ref}/>),
    EditIcon: forwardRef((props, ref) => <EditIcon {...props} ref={ref}/>),
    ThemedEditIcon: forwardRef((props, ref) => <EditIcon color="primary" {...props} ref={ref}/>),
    EditOutlinedIcon: forwardRef((props, ref) => <EditOutlinedIcon {...props} ref={ref}/>),
    EmailIcon: forwardRef((props, ref) => <EmailIcon {...props} ref={ref}/>),
    LinkedInIcon: forwardRef((props, ref) => <LinkedInIcon {...props} ref={ref}/>),
    VideoLibraryIcon: forwardRef((props, ref) => <VideoLibraryIcon {...props} ref={ref}/>),
    AddToPhotosIcon: forwardRef((props, ref) => <AddToPhotosIcon {...props} ref={ref}/>),
    SettingsIcon: forwardRef((props, ref) => <SettingsIcon {...props} ref={ref}/>),
    VideoLibraryOutlinedIcon: forwardRef((props, ref) => <VideoLibraryOutlinedIcon {...props} ref={ref}/>),
    LibraryAddOutlinedIcon: forwardRef((props, ref) => <LibraryAddOutlinedIcon {...props} ref={ref}/>),
    DeleteForeverIcon: forwardRef((props, ref) => <DeleteForeverIcon {...props} ref={ref}/>),
    RedDeleteForeverIcon: forwardRef((props, ref) => <DeleteForeverIcon color="error" {...props} ref={ref}/>),
    RotateLeftIcon: forwardRef((props, ref) => <RotateLeftIcon {...props} ref={ref}/>),
    DeleteForeverOutlinedIcon: forwardRef((props, ref) => <DeleteForeverOutlinedIcon {...props} ref={ref}/>)
};

export const exportSelectionAction = (columns = [], title="Selected_Table") => {
    return {
        position: "toolbarOnSelect",
        icon: SaveAlt,
        tooltip: "Export the selected rows!",
        onClick: (e, rowData) => {
            const tableTitle = title.split(" ").join("_")
            const builder = new CsvBuilder(
                tableTitle + ".csv"
            );
            builder
                .setColumns(
                    columns.map(
                        (columnDef) => columnDef.title
                    )
                )
                .addRows(
                    rowData.map((rowData) =>
                        columns.map(
                            (columnDef) =>
                                rowData[columnDef.field]
                        )
                    )
                )
                .exportFile();
        },
    }
}

const componentDecorator = (href, text, key) => (
    <a href={href} key={key} target="_blank">
        {text}
    </a>
);

export const LinkifyText = (text) => {
    return(
        <Linkify componentDecorator={componentDecorator}>
            {text}
        </Linkify>
    )
}

export const customDonutConfig = [{
    display: false,
    fontStyle: 'bold',
    textShadow: true,
    overlap: true,
    fontColor: "white",
    render: ({percentage}) => {
        // args will be something like:
        // { label: 'Label', value: 123, percentage: 50, index: 0, dataset: {...} }
        return percentage > 2 ? percentage + "%" : "";
        // return object if it is image
        // return { src: 'image.png', width: 16, height: 16 };
    }
}]

export const defaultTableOptions = {
    filtering: true,
    selection: true,
    pageSize: 5,
    columnsButton: true,
    pageSizeOptions: [3, 5, 10, 25, 50, 100, 200],
    minBodyHeight: 200,
    exportAllData: true,
    exportDelimiter: ";",
    exportButton: {csv: true, pdf: true}// PDF is false because its buggy and throws errors
}

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


export const getDate = (rowData, prop) => {
    return prettyDate(rowData[prop])
}
export const getCount = ({value}) => {
    return value ? value.length : 0
}
export const renderLongText = ({value}) => {
    return (
        <Tooltip title={
            <Typography style={{fontSize: "1.2rem"}}>
                {value}
            </Typography>
        }>
            <Typography variant="inherit" noWrap>
                {value}
            </Typography>
        </Tooltip>
    )
}


export const renderAppearAfter = ({appearAfter}) => {
    return (
        <Typography variant="inherit" noWrap>
            {getMinutes(appearAfter)}
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
export const StarRatingInputValue = ({columnDef, onFilterChanged}) => {
    const [rating, setRating] = useState(0);
    return (
        <Box>
            <Typography component="legend">Up to:</Typography>
            <Rating
                name={`ratings-${columnDef.tableData.id}`}
                placeholder="Ratings lower than"
                value={rating}
                onChange={(event, value) => {
                    setRating(value)
                    onFilterChanged(columnDef.tableData.id, `${value}`);
                }}
                precision={0.5}
            />
        </Box>
    );
}

export const renderRating = ({value, id}) => {

    return (
        <Box display="flex" alignItems="center">
            <Rating
                readOnly
                name={id}
                value={Number(value)}
                precision={0.5}
            />
            {value ?
                <Typography
                    style={{
                        marginLeft: 8,
                        color: "grey",
                        fontWeight: 500
                    }}>
                    {value}
                </Typography> : null}
        </Box>
    )
}
export const renderRatingStars = ({rating, id}) => {
    return (
        <Box display="flex" alignItems="center">
            <Rating
                readOnly
                name={id}
                value={Number(rating)}
                precision={0.5}
            />
            {Number(rating) > 0 &&
            <Typography
                style={{
                    marginLeft: 8,
                    color: "grey",
                    fontWeight: 500
                }}>
                {rating}
            </Typography>}
        </Box>
    )
}


export const filterModel = {
    items: [
        // {columnField: 'rating', value: '3.5', operatorValue: '>='}
    ],
};
