import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent, CardHeader, IconButton} from "@material-ui/core";
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
const useStyles = makeStyles(theme => ({}));

const FilterCard = ({}) => {

    const classes = useStyles()

    return (
        <Card>
            <CardHeader
                title="Filter 1"
                subheader="Eth students"
                action={
                    <IconButton>
                        <SaveOutlinedIcon/>
                    </IconButton>
                }
            />
            <CardContent>

            </CardContent>
        </Card>
    );
};

export default FilterCard;
