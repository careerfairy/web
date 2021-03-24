import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Doughnut} from 'react-chartjs-2';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Typography,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Button,
    Tabs,
    Tab,
} from '@material-ui/core';
import {colorsArray} from "../../../../../util/colors";
import {withFirebase} from "../../../../../../context/firebase";
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import {prettyDate} from "../../../../../helperFunctions/HelperFunctions";
import CustomLegend from "../../../../../../materialUI/Legends";
import Chart from 'chart.js';
import 'chartjs-plugin-labels';
import {customDonutConfig} from "../common/TableUtils";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {useSelector} from "react-redux";
import {createSelector} from 'reselect'
import StatsUtil from "../../../../../../data/util/StatsUtil";

const audienceSelector = createSelector(
    state => state,
    (_, {currentUserDataSet}) => currentUserDataSet,
    (_, {currentGroup}) => currentGroup,
    (_, {currentStream}) => currentStream,
    (_, {localUserType}) => localUserType,
    (_, {streamsFromTimeFrameAndFuture}) => streamsFromTimeFrameAndFuture,
    (state, currentUserDataSet, currentGroup, currentStream, localUserType, streamsFromTimeFrameAndFuture) => {
        const totalUsers = currentUserDataSet.dataSet === "groupUniversityStudents" ?
            state.firestore.ordered[currentUserDataSet.dataSet]
            : state.userDataSet.ordered
        if (currentStream) {
            return totalUsers?.filter(user => currentStream[localUserType.propertyName]?.includes(user.userEmail) && StatsUtil.studentFollowsGroup(user, currentGroup))
        } else {
            return totalUsers?.filter(user => streamsFromTimeFrameAndFuture?.some(stream => stream?.[localUserType.propertyName]?.includes(user.userEmail) && StatsUtil.studentFollowsGroup(user, currentGroup)))
        }
    }
)
Chart.defaults.global.plugins.labels = false;


const useStyles = makeStyles(() => ({
    root: {
        height: '100%'
    }
}));

function randomColor() {
    var max = 0xffffff;
    return '#' + Math.round(Math.random() * max).toString(16);
}

const initialCurrentCategory = {options: []}

const CategoryBreakdown = ({
                               group,
                               setCurrentStream,
                               currentStream,
                               // typesOfOptions,
                               userTypes,
                               breakdownRef,
                               setUserType,
                               currentUserDataSet,
                               handleReset,
                               // setCurrentCategory,
                               // currentCategory,
                               streamsFromTimeFrameAndFuture,
                               isUni,
                               groups,
                               localUserType,
                               setLocalUserType,
                               className,
                               ...rest
                           }) => {
    const classes = useStyles();
    const theme = useTheme();
    const chartRef = useRef()
    const [localColors, setLocalColors] = useState(colorsArray);
    const [total, setTotal] = useState(0);
    const [showPercentage, setShowPercentage] = useState(true);
    const [value, setValue] = useState(0);
    const [currentGroup, setCurrentGroup] = useState(groups?.[0] || {});
    const [typesOfOptions, setTypesOfOptions] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(initialCurrentCategory);
    const audience = useSelector(state =>
        audienceSelector(state, {
            currentGroup,
            currentStream,
            localUserType,
            streamsFromTimeFrameAndFuture,
            currentUserDataSet
        })
    )
    const [data, setData] = useState({
        datasets: [],
        labels: [],
        ids: []
    });


    useEffect(() => {
        if (groups?.length || !currentGroup?.id) {
            setCurrentGroup(groups[0])
            setCurrentCategory(groups?.[0]?.categories?.[0] || initialCurrentCategory)
            setValue(0)
        }
    }, [groups])

    useEffect(() => {
        if (group.categories?.length) {
            if (localColors.length < typesOfOptions.length) { // only add more colors if there arent enough colors
                setLocalColors([...colorsArray, ...typesOfOptions.map(() => randomColor())])
            }
        }
    }, [group.categories, typesOfOptions.length])

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
                    borderWidth: 8,
                    borderColor: theme.palette.common.white,
                    hoverBorderColor: theme.palette.common.white
                }
            ],
            labels: typesOfOptions.map(option => option.name),
            ids: typesOfOptions.map(option => option.id)
        })
    }, [typesOfOptions, localColors])

    const getTypeOfStudents = () => {
        const aggregateCategories = getAggregateCategories(audience)
        const flattenedGroupOptions = [...currentCategory.options].map(option => {
            const count = aggregateCategories.filter(category => category.categories.some(userOption => userOption.selectedValueId === option.id)).length
            return {...option, count}
        })
        return flattenedGroupOptions.sort((a, b) => b.count - a.count);
    }

    const getAggregateCategories = (participants) => {
        let categories = []
        participants?.forEach(user => {
            const matched = user.registeredGroups?.find(groupData => groupData.groupId === currentGroup.id)
            if (matched) {
                categories.push(matched)
            }
        })
        return categories
    }


    const options = {
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
            labels: showPercentage && customDonutConfig
        },
    };

    const handleChange = (event, newValue) => {
        setCurrentGroup(groups[newValue])
        setCurrentCategory(groups[newValue].categories?.[0] || initialCurrentCategory)
        setValue(newValue);
    };


    const hasNoData = () => {
        return Boolean(typesOfOptions.length && total === 0)
    }


    const handleMenuItemClick = (event, index) => {
        setLocalUserType(userTypes[index])
    };

    const handleGroupCategorySelect = ({target: {value}}) => {
        const targetCategory = currentGroup.categories.find(category => category.id === value)
        if (targetCategory) {
            setCurrentCategory(targetCategory)
        }
    }

    const togglePercentage = () => {
        setShowPercentage(!showPercentage)
    }

    const hasPartnerGroups = Boolean(groups.length > 1)

    return (
        <Card
            raised={Boolean(currentStream)}
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardHeader
                title={`${localUserType.displayName}`}
                ref={breakdownRef}
                subheader={
                    currentStream ? `That attended ${currentStream.company} on ${prettyDate(currentStream.start)}` : "For All Events"
                }
                action={
                    currentStream &&
                    <Button size="small"
                            variant="text"
                            onClick={handleReset}
                            endIcon={<RotateLeftIcon/>}
                    >
                        Reset
                    </Button>
                }
            />
            {hasPartnerGroups &&
            <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
            >
                {groups?.map(cc => <Tab key={cc.id} wrapped label={cc.universityName}/>)}
            </Tabs>}
            <Divider/>
            <Tabs
                value={localUserType.propertyName}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                aria-label="students-type-tabs"
            >
                {userTypes.map(({displayName, propertyName}, index) => (
                    <Tab
                        wrapped
                        key={propertyName}
                        value={propertyName}
                        onClick={(event) => handleMenuItemClick(event, index)}
                        label={displayName}
                    />
                ))}
            </Tabs>
            <Divider/>
            <CardContent>
                {currentCategory.id &&
                <>
                    <Select
                        value={currentCategory.id}
                        variant="outlined"
                        fullWidth
                        onChange={handleGroupCategorySelect}
                    >
                        {currentGroup.categories.map(({id, name}) => (
                            <MenuItem key={id} value={id}>{name}</MenuItem>
                        ))}
                    </Select>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showPercentage}
                                onChange={togglePercentage}
                                name="percentageToggle"
                                color="primary"
                            />
                        }
                        label={
                            <Typography className={classes.toggleLabel}>
                                Show Percentage
                            </Typography>
                        }
                    />
                </>
                }
                <Box
                    height={300}
                    position="relative"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    {hasNoData() ?
                        <>
                            <Typography>
                                Not enough {localUserType.displayName} data
                            </Typography>
                            <Button size="small"
                                    variant="text"
                                    onClick={handleReset}
                                    endIcon={<RotateLeftIcon/>}
                            >
                                Reset
                            </Button>
                        </>
                        :
                        <Doughnut
                            data={data}
                            ref={chartRef}
                            options={options}
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

CategoryBreakdown.propTypes = {
    className: PropTypes.string
};

export default withFirebase(CategoryBreakdown);
