import PropTypes from 'prop-types'
import React from 'react';
import * as actions from '../../../../../store/actions'
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardActions, CardHeader} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import {DynamicColorButton} from "../../../../../materialUI/GlobalButtons/GlobalButtons";
import {isLoaded} from "react-redux-firebase";

const useStyles = makeStyles(theme => ({}));

const Toolbar = () => {

    const classes = useStyles()
    const dispatch = useDispatch()
    const currentFilterGroup = useSelector(state => state.currentFilterGroup)
    const handleCreateNewDataSet = () => dispatch(actions.createFilterGroup())
    const handleDeleteCurrentFilterGroup = () => dispatch(actions.deleteFilterGroup(currentFilterGroup.id))
    const groupsLoaded = useSelector(({firestore: {data: {careerCenterData}}}) => isLoaded(careerCenterData))


    const currentFilterGroupLabel = useSelector(state => state.currentFilterGroup.data.label || "")

    const loading = Boolean(currentFilterGroup.loading || !groupsLoaded)

    return (
        <Card>
            <CardHeader
                title="Create and manage statistics"
                subheader={currentFilterGroupLabel}
            />
            <CardActions>
                <DynamicColorButton
                    variant="contained"
                    loading={loading}
                    size="large"
                    color="primary"
                    onClick={handleCreateNewDataSet}
                >
                    Create a new Dataset
                </DynamicColorButton>
                {currentFilterGroup.data &&
                <DynamicColorButton
                    loading={loading}
                    variant="contained"
                    size="large"
                    color="secondary"
                    onClick={handleDeleteCurrentFilterGroup}
                >
                    Delete Current Dataset
                </DynamicColorButton>}
                <DynamicColorButton
                    type="submit"
                    loading={loading}
                    variant="contained"
                    size="large"
                    color="#44a6c6"
                >
                    Query Current Dataset
                </DynamicColorButton>
            </CardActions>
        </Card>
    );
};
Toolbar.propTypes = {
    handleQueryCurrentFilterGroup: PropTypes.func.isRequired
}

export default Toolbar;

