import PropTypes from 'prop-types'
import React from 'react';
import * as actions from '../../../../../store/actions'
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardActions, CardHeader, Typography} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import {DynamicColorButton} from "../../../../../materialUI/GlobalButtons/GlobalButtons";
import {colorsArray} from "../../../../util/colors";

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
    const currentFilterGroupLabel = useSelector(state => state.currentFilterGroup.data.label || "")

    return (
        <Card>
            <CardHeader
                title={totalCount ?
                    <React.Fragment>
                        <Typography variant="h4">
                            Total users: {totalCount}
                        </Typography>
                        {filteredCount &&
                        <Typography color="textSecondary" variant="h5">
                            Filtered Users {filteredCount}
                        </Typography>}
                    </React.Fragment>
                    : "Make a query"}
                subheader={currentFilterGroupLabel}
            />
            <CardActions>
                <DynamicColorButton
                    variant="contained"
                    disabled={loading}
                    size="large"
                    color={colorsArray[0]}
                    onClick={handleCreateNewDataSet}
                >
                    Create a new Dataset
                </DynamicColorButton>
                {currentFilterGroup.data &&
                <DynamicColorButton
                    disabled={loading}
                    variant="contained"
                    size="large"
                    color={colorsArray[1]}
                    onClick={handleDeleteCurrentFilterGroup}
                >
                    Delete Current Dataset
                </DynamicColorButton>}
                <DynamicColorButton
                    onClick={queryDataSet}
                    disabled={loading || justFiltered}
                    variant="contained"
                    color={colorsArray[2]}
                    size="large"
                >
                    Query Current Dataset
                </DynamicColorButton>
                <DynamicColorButton
                    disabled={loading}
                    variant="contained"
                    color={colorsArray[3]}
                    size="large"
                >
                    Save Current Dataset
                </DynamicColorButton>
            </CardActions>
        </Card>
    );
};

Toolbar.propTypes = {
    queryDataSet: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
}

export default Toolbar;

