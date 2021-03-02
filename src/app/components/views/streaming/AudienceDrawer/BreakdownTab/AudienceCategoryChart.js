import PropTypes from 'prop-types'
import React, {useEffect, useRef, useState} from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";
import clsx from "clsx";
import {Box, Card, CardContent, CardHeader, MenuItem, Select, Tab, Tabs, Typography} from "@material-ui/core";
import {colorsArray} from "../../../../util/colors";
import {getRandomColor} from "../../../../helperFunctions/HelperFunctions";
import Chart from 'chart.js';
import 'chartjs-plugin-labels';
import {percentageDonutConfig} from "../../../../util/chartUtils";
import {Doughnut} from "react-chartjs-2";
import CustomLegend from "../../../../../materialUI/Legends";

Chart.defaults.global.plugins.labels = false;

const useStyles = makeStyles(theme => ({
    root: {
        background: theme.palette.background.default,
    },
    header: {
        paddingBottom: 0
    },
}));

const getChartOptions = (theme) => ({
    cutoutPercentage: 70,
    layout: {padding: 0},
    legend: {
        display: false
    },
    maintainAspectRatio: false,
    responsive: true,
    tooltips: {
        backgroundColor: theme.palette.background.default,
        bodyFontColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        enabled: true,
        footerFontColor: theme.palette.text.secondary,
        intersect: false,
        mode: 'index',
        titleFontColor: theme.palette.text.primary
    },
    plugins: {
        labels: percentageDonutConfig
    },
})

const AudienceCategoryChart = ({className, audience, ...rest}) => {
    const theme = useTheme()
    const classes = useStyles()
    const {currentLivestream: {careerCenters}} = useCurrentStream()
    const chartRef = useRef()
    const [value, setValue] = useState(0);
    const [total, setTotal] = useState(0);
    const [currentGroup, setCurrentGroup] = useState(careerCenters[0]);
    const [localColors, setLocalColors] = useState(colorsArray);
    const [currentCategory, setCurrentCategory] = useState({options: []});
    const [chartOptions, setChartOptions] = useState(getChartOptions(theme));
    const [typesOfOptions, setTypesOfOptions] = useState([]);

    const [data, setData] = useState({
        datasets: [],
        labels: [],
        ids: []
    });

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
        const newTypeOfOptions = getTypeOfStudents()
        setTypesOfOptions(newTypeOfOptions)
    }, [audience, currentCategory])

    useEffect(() => {
        if (typesOfOptions.length) {
            const totalCount = typesOfOptions.reduce((acc, curr) => {
                return acc + curr.count
            }, 0)
            setTotal(totalCount)
        }
    }, [typesOfOptions])

    useEffect(() => {
        setData({
            datasets: [
                {
                    data: typesOfOptions.map(option => option.count),
                    backgroundColor: localColors,
                    hoverBorderColor: theme.palette.common.white,
                    borderColor: theme.palette.background.default
                }
            ],
            labels: typesOfOptions.map(option => option.name),
            ids: typesOfOptions.map(option => option.id)
        })
    }, [typesOfOptions, localColors, theme.palette.type])

    useEffect(() => {
        setChartOptions(getChartOptions(theme))
    }, [theme.palette.type])

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
        setCurrentCategory(careerCenters[newValue].categories[0])
        setValue(newValue);
    };

    const handleGroupCategorySelect = ({target: {value}}) => {
        const targetCategory = currentGroup.categories.find(category => category.id === value)
        if (targetCategory) {
            setCurrentCategory(targetCategory)
        }
    }

    const hasNoData = () => {
        return Boolean(typesOfOptions.length && total === 0)
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
                    value={currentCategory.id || ""}
                    onChange={handleGroupCategorySelect}
                >
                    {currentGroup.categories.map(({id, name}) => (
                        <MenuItem key={id} value={id}>{name}</MenuItem>
                    ))}
                </Select>
                <Box
                    height={300}
                    marginTop={2}
                    position="relative"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    {hasNoData() ?
                        <>
                            <Typography>
                                Not enough participant data
                            </Typography>
                        </>
                        :
                        <Doughnut
                            data={data}
                            ref={chartRef}
                            options={chartOptions}
                        />}
                </Box>
                {!hasNoData() &&
                <Box
                    display="flex"
                    justifyContent="center"
                    mt={2}
                >
                    <CustomLegend
                        options={currentCategory.options}
                        colors={localColors}
                        chartRef={chartRef}
                        fullWidth
                        chartData={data}
                        optionDataType="Student"
                        optionValueProp="count"
                    />
                </Box>}
            </CardContent>
        </Card>
    );
};

AudienceCategoryChart.propTypes = {
    className: PropTypes.string,
    audience: PropTypes.array.isRequired
}

export default AudienceCategoryChart;

