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
    makeStyles,
    colors,
    useTheme, Select, MenuItem
} from '@material-ui/core';
import {colorsArray} from "../../../../../util/colors";
import {withFirebase} from "../../../../../../context/firebase";
import Button from "@material-ui/core/Button";
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import {prettyDate} from "../../../../../helperFunctions/HelperFunctions";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import CustomLegend from "../../../../../../materialUI/Legends";


const useStyles = makeStyles(() => ({
    root: {
        height: '100%'
    }
}));

function randomColor() {
    var max = 0xffffff;
    return '#' + Math.round(Math.random() * max).toString(16);
}

const CategoryBreakdown = ({
                               group,
                               setCurrentStream,
                               currentStream,
                               typesOfOptions,
                               userTypes,
                               breakdownRef,
                               setUserType,
                               userType,
                               setCurrentCategory,
                               currentCategory,
                               className,
                               ...rest
                           }) => {
    const classes = useStyles();
    const theme = useTheme();
    const chartRef = useRef()

    const [localColors, setLocalColors] = useState(colorsArray);
    const [total, setTotal] = useState(0);
    const [data, setData] = useState({
        datasets: [],
        labels: [],
        ids: []
    });


    useEffect(() => {
        if (group.categories?.length) {
            if (localColors.length < typesOfOptions.length) { // only add more colors if there arent enough colors
                setLocalColors([...colorsArray, ...typesOfOptions.map(() => randomColor())])
            }
        }
    }, [group.categories, typesOfOptions.length])

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
                    borderColor: colors.common.white,
                    hoverBorderColor: colors.common.white
                }
            ],
            labels: typesOfOptions.map(option => option.name),
            ids: typesOfOptions.map(option => option.id)
        })
    }, [typesOfOptions, localColors])


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
            labels: [{
                fontColor: 'white',
                render: 'percent',
                fontStyle: 'bold',
                arc: false,
            }]
        },
    };

    const hasNoData = () => {
        return Boolean(typesOfOptions.length && total === 0)
    }
    const handleReset = () => {
        setCurrentStream(null)
        setUserType(userTypes[0])
    }

    const handleMenuItemClick = (event, index) => {
        setUserType(userTypes[index])
    };

    const handleGroupCategorySelect = ({target: {value}}) => {
        const targetCategory = group.categories.find(category => category.id === value)
        if (targetCategory) {
            setCurrentCategory(targetCategory)
        }
    }

    return (
        <Card
            raised={Boolean(currentStream)}
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardHeader
                title={`Breakdown of ${userType.displayName}`}
                ref={breakdownRef}
                subheader={
                    currentStream ? `That attended ${currentStream.company} on ${prettyDate(currentStream.start)}` : "on average"
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
            <Divider/>
            <Tabs
                value={userType.propertyName}
                indicatorColor="primary"
                textColor="primary"
                aria-label="disabled tabs example"
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
                <Select
                    value={currentCategory.id}
                    label={"currentCategory.name"}
                    onChange={handleGroupCategorySelect}
                >
                    {group.categories.map(({id, name}) => (
                        <MenuItem key={id} value={id}>{name}</MenuItem>
                    ))}
                </Select>}
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
                                Not enough {userType.displayName} data
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
