import PropTypes from 'prop-types'
import React, {useEffect, useMemo, useState} from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";
import clsx from "clsx";
import {Box, Card, CardContent, CardHeader, MenuItem, Select, Tab, Tabs} from "@material-ui/core";
import {colorsArray} from "../../../../util/colors";
import {getRandomColor} from "../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles(theme => ({
    root: {
        background: theme.palette.background.default,
    },
    header: {
        paddingBottom: 0
    },
}));

const AudienceCategoryChart = ({className, audience, ...rest}) => {
    const theme = useTheme()
    const classes = useStyles()
    const {currentLivestream: {careerCenters}} = useCurrentStream()
    const [value, setValue] = useState(0);
    const [currentGroup, setCurrentGroup] = useState(careerCenters[0]);
    const [localColors, setLocalColors] = useState(colorsArray);
    const [currentCategory, setCurrentCategory] = useState({options: []});
    const [typesOfOptions, setTypesOfOptions] = useState([]);

    const [data, setData] = useState({
        datasets: [],
        labels: [],
        ids: []
    });
    console.log("-> data", data);
    console.log("-> currentGroup", currentGroup);

    useEffect(() => {
        if (currentGroup.categories?.length) {
            if (localColors.length < typesOfOptions.length) { // only add more colors if there arent enough colors
                setLocalColors([...colorsArray, ...typesOfOptions.map(() => getRandomColor())])
            }
        }
    }, [currentGroup.categories, typesOfOptions.length])

    useEffect(() => {
        if (currentGroup.categories?.length) {
            setCurrentCategory({...currentGroup.categories[0]})
        }

    }, [currentGroup.categories])

    useEffect(() => {
        console.log("-> In the getTypeOfStudents");
        const newTypeOfOptions = getTypeOfStudents()
        setTypesOfOptions(newTypeOfOptions)
    }, [audience, currentCategory])

    useEffect(() => {
        setData({
            datasets: [
                {
                    data: typesOfOptions.map(option => option.count),
                    backgroundColor: localColors,
                    borderWidth: 8,
                    borderColor: theme.palette.common.white,
                    hoverBorderColor: theme.palette.common.white
                }
            ],
            labels: typesOfOptions.map(option => option.name),
            ids: typesOfOptions.map(option => option.id)
        })
    }, [typesOfOptions, localColors])

    const getAggregateCategories = (participants) => {
        let categories = []
        participants.forEach(user => {
            const matched = user.registeredGroups?.find(groupData => groupData.groupId === currentGroup.id)
            if (matched) {
                categories.push(matched)
            }
        })
        return categories
    }

    const getTypeOfStudents = () => {
        const aggregateCategories = getAggregateCategories(audience)
        const flattenedGroupOptions = [...currentCategory.options].map(option => {
            const count = aggregateCategories.filter(category => category.categories.some(userOption => userOption.selectedValueId === option.id)).length
            return {...option, count}
        })
        return flattenedGroupOptions.sort((a, b) => b.count - a.count);
    }

    const handleChange = (event, newValue) => {
        setCurrentGroup(careerCenters[newValue])
        setValue(newValue);
    };

    const handleGroupCategorySelect = ({target: {value}}) => {
        const targetCategory = currentGroup.categories.find(category => category.id === value)
        if (targetCategory) {
            setCurrentCategory(targetCategory)
        }
    }


    return (
        <Card className={clsx(classes.root, className)} {...rest}>
            <CardHeader
                className={classes.header}
                title="Breakdown for:"
            />
            <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
            >
                {careerCenters.map(cc => <Tab key={cc.id} wrapped label={cc.universityName}/>)}
            </Tabs>
            <CardContent>
                <Select
                    fullWidth
                    variant="outlined"
                    value={currentCategory.id}
                    onChange={handleGroupCategorySelect}
                >
                    {currentGroup.categories.map(({id, name}) => (
                        <MenuItem key={id} value={id}>{name}</MenuItem>
                    ))}
                </Select>

            </CardContent>
        </Card>
    );
};

AudienceCategoryChart.propTypes = {
    className: PropTypes.string,
    audience: PropTypes.array.isRequired
}

export default AudienceCategoryChart;

