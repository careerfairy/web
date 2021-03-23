import React from 'react';
import * as actions from '../../../../../store/actions'
import {makeStyles} from "@material-ui/core/styles";
import {Button, Card, CardActions, CardHeader} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import {DynamicColorButton} from "../../../../../materialUI/GlobalButtons/GlobalButtons";

const useStyles = makeStyles(theme => ({}));

const Toolbar = ({}) => {

    const classes = useStyles()
    const dispatch = useDispatch()
    const currentFilterGroup = useSelector(state => state.currentFilterGroup)
    const handleCreateNewDataSet = () => dispatch(actions.createFilterGroup())
    const handleDeleteCurrentFilterGroup = () => dispatch(actions.deleteFilterGroup(currentFilterGroup.id))

    return (
        <Card>
            <CardHeader
                title="Create and manage statistics"
            />
            <CardActions>
                <DynamicColorButton
                    variant="contained"
                    loading={currentFilterGroup.loading}
                    size="large"
                    color="primary"
                    onClick={handleCreateNewDataSet}
                >
                    Create a new Dataset
                </DynamicColorButton>
                {currentFilterGroup.data &&
                <DynamicColorButton
                    loading={currentFilterGroup.loading}
                    variant="contained"
                    size="large"
                    color="secondary"
                    onClick={handleDeleteCurrentFilterGroup}
                >
                    Delete Current Dataset
                </DynamicColorButton>}
            </CardActions>
        </Card>
    );
};

export default Toolbar;
