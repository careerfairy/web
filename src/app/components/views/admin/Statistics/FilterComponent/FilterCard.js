import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent, CardHeader, CircularProgress, IconButton} from "@material-ui/core";
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import {useSelector} from "react-redux";
import useFollowers from "../../../../custom-hook/useFollowers";

const useStyles = makeStyles(theme => ({}));

const FilterCard = ({filter}) => {
    const {filterOptions, groupId} = filter
    // const {loading} = useFollowers(groupId)
    const {universityName} = useSelector(state => state.firestore.data.careerCenterData?.[groupId] || {})
    const classes = useStyles()

    return (
        <Card>
            <CardHeader
                title={universityName}
                subheader="Eth students"
                action={
                    <IconButton>
                        <SaveOutlinedIcon/>
                    </IconButton>
                    // loading ?
                    //     (<CircularProgress size={20}/>)
                    //     : (<IconButton>
                    //         <SaveOutlinedIcon/>
                    //     </IconButton>)
                }
            />
            <CardContent>

            </CardContent>
        </Card>
    );
};

FilterCard.propTypes = {
    filter: PropTypes.shape({
        groupId: PropTypes.string.isRequired,
        filterOptions: PropTypes.arrayOf(PropTypes.shape({
            category: PropTypes.string,
            targetOptions: PropTypes.arrayOf(PropTypes.string)
        }))
    }).isRequired
}
export default FilterCard;

