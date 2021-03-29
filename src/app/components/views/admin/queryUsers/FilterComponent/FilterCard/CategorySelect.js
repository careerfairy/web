import PropTypes from 'prop-types'
import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Box, Chip, IconButton, TextField} from "@material-ui/core";
import {Autocomplete} from "@material-ui/lab";
import {convertArrayOfObjectsToDictionaryByProp} from "../../../../../../data/util/AnalyticsUtil";
import {useDispatch} from "react-redux";
import * as actions from '../../../../../../store/actions'
import CancelSharpIcon from '@material-ui/icons/CancelSharp';

const useStyles = makeStyles(theme => ({
    inputWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        "& .MuiTextField-root": {
            minWidth: 300
        }
    }
}));

const CategorySelect = ({option, groupId, handleRemoveFilterOption}) => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const {data: {options, name}, categoryId, targetOptionIds} = option
    const [optionsMap, setOptionsMap] = useState({});
    const [arrayOfOptionIds, setArrayOfOptionIds] = useState([]);

    useEffect(() => {
        if (options?.length) {
            const newOptionsMap = convertArrayOfObjectsToDictionaryByProp(options, "id")
            setArrayOfOptionIds(options.map(({id}) => id))
            setOptionsMap(newOptionsMap)
        }
    }, [options])

    const handleChange = (newTargetOptionIds, categoryId, groupId) => {
        dispatch(actions.setFilterOptionTargetOptions(newTargetOptionIds, categoryId, groupId))
    }

    const handleDeleteTargetOption = (targetOptionIds, optionIdToRemove, categoryId, groupId) => {
        const newTargetOptionIds = targetOptionIds.filter(optionId => optionId !== optionIdToRemove)
        dispatch(actions.setFilterOptionTargetOptions(newTargetOptionIds, categoryId, groupId))
    }

    return (
        <Autocomplete
            multiple
            id="tags-outlined"
            options={arrayOfOptionIds}
            value={targetOptionIds || []}
            onChange={(e, value) => handleChange(value, categoryId, groupId)}
            getOptionLabel={(option) => optionsMap[option]?.name}
            defaultValue={targetOptionIds}
            filterSelectedOptions
            renderInput={(params) => (
                <div className={classes.inputWrapper}>
                    <TextField
                        {...params}
                        variant="outlined"
                        label={name}
                        fullWidth={false}
                        placeholder="Choose options"
                    />
                    <Box ml={1}>
                        <IconButton onClick={() => handleRemoveFilterOption(categoryId, groupId)} color="secondary">
                            <CancelSharpIcon/>
                        </IconButton>
                    </Box>
                </div>
            )}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip variant="default"
                          label={optionsMap[option]?.name}
                          {...getTagProps({index})}
                          onDelete={() => handleDeleteTargetOption(targetOptionIds, option, categoryId, groupId)}
                    />
                ))
            }
        />
    );
};

CategorySelect.propTypes = {
    groupId: PropTypes.string.isRequired,
    handleRemoveFilterOption: PropTypes.func.isRequired,
    option: PropTypes.shape({
        categoryId: PropTypes.string,
        targetOptionIds: PropTypes.arrayOf(PropTypes.string),
        data: PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
            options: PropTypes.arrayOf(PropTypes.shape({
                id: PropTypes.string
            }).isRequired)
        })
    })
}

export default CategorySelect;

