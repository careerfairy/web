import PropTypes from 'prop-types'
import React, {useState} from 'react';
import * as actions from '../../../../../store/actions'
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardActions, CardHeader, Typography} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import {DynamicColorButton} from "../../../../../materialUI/GlobalButtons/GlobalButtons";
import SaveIcon from '@material-ui/icons/Save';
import CreateIcon from '@material-ui/icons/PostAdd';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import SearchIcon from '@material-ui/icons/Search';
import {colorsArray} from "../../../../util/colors";
import DataSetDrawer from "./DataSetDrawer";

const useStyles = makeStyles(theme => ({}));

const Toolbar = ({queryDataSet, loading}) => {

    const classes = useStyles()
    const dispatch = useDispatch()
    const currentFilterGroup = useSelector(state => state.currentFilterGroup)
    const handleCreateNewDataSet = () => dispatch(actions.createFilterGroup())
    const handleDeleteCurrentFilterGroup = () => dispatch(actions.deleteFilterGroup(currentFilterGroup.id))
    const totalCount = useSelector(state => state.currentFilterGroup.totalStudentsData.count)
    const filteredCount = useSelector(state => state.currentFilterGroup.filteredStudentsData.count)
    const justFiltered = useSelector(state => state.currentFilterGroup.justFiltered)
    const [datasetDrawerOpen, setDatasetDrawerOpen] = useState(false);
    const currentFilterGroupLabel = useSelector(state => state.currentFilterGroup.data.label || "")

    const handleOpenDataSetDrawer = () => setDatasetDrawerOpen(true)
    const handleCloseDataSetDrawer = () => setDatasetDrawerOpen(false)

    return (
        <Card>
            <CardHeader
                title={totalCount ?
                    <React.Fragment>
                        {filteredCount &&
                        <Typography variant="h4">
                            Filtered Users {filteredCount}
                        </Typography>}
                        <Typography color="textSecondary" variant="h5">
                            Total users: {totalCount}
                        </Typography>
                    </React.Fragment>
                    : "Make a query"}
                subheader={currentFilterGroupLabel}
            />
            <CardActions>
                <DynamicColorButton
                    disabled={loading}
                    startIcon={<SaveIcon/>}
                    variant="contained"
                    color={colorsArray[0]}
                    size="large"
                >
                    Save Current Dataset
                </DynamicColorButton>
                <DynamicColorButton
                    variant="contained"
                    disabled={loading}
                    startIcon={<CreateIcon/>}
                    size="large"
                    color={colorsArray[1]}
                    onClick={handleCreateNewDataSet}
                >
                    Create a new Dataset
                </DynamicColorButton>
                {currentFilterGroup.data &&
                <DynamicColorButton
                    disabled={loading}
                    variant="contained"
                    startIcon={<DeleteIcon/>}
                    size="large"
                    color={colorsArray[2]}
                    onClick={handleDeleteCurrentFilterGroup}
                >
                    Delete Current Dataset
                </DynamicColorButton>}
                <DynamicColorButton
                    variant="contained"
                    disabled={loading}
                    startIcon={<SearchIcon/>}
                    size="large"
                    color={colorsArray[3]}
                    onClick={handleOpenDataSetDrawer}
                >
                    Choose Another Dataset
                </DynamicColorButton>
                {/* Querying is automatic now*/}
                {/*<DynamicColorButton*/}
                {/*    onClick={queryDataSet}*/}
                {/*    disabled={loading || justFiltered}*/}
                {/*    variant="contained"*/}
                {/*    color={colorsArray[4]}*/}
                {/*    size="large"*/}
                {/*>*/}
                {/*    Query Current Dataset*/}
                {/*</DynamicColorButton>*/}
                <DataSetDrawer open={datasetDrawerOpen} onClose={handleCloseDataSetDrawer}/>
            </CardActions>
        </Card>
    );
};

Toolbar.propTypes = {
    queryDataSet: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
}

export default Toolbar;

