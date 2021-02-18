import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Doughnut} from 'react-chartjs-2';
import {Box, Card, CardContent,  Divider, Typography} from '@material-ui/core';
import {colorsArray} from "../../../../../util/colors";
import {withFirebase} from "../../../../../../context/firebase";
import {convertStringToArray} from "../../../../../helperFunctions/HelperFunctions";
import CustomLegend from "../../../../../../materialUI/Legends";
import {customDonutConfig} from "../common/TableUtils";
import {makeStyles, useTheme} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    root: {
        height: '100%',
    }
}));

function randomColor() {
    var max = 0xffffff;
    return '#' + Math.round(Math.random() * max).toString(16);
}

const initialData = {
    datasets: [],
    labels: []
}

const FeedbackGraph = ({
                           group,
                           setCurrentStream,
                           currentStream,
                           typesOfOptions,
                           userTypes,
                           setUserType,
                           currentPoll,
                           userType,
                           streamDataType,
                           className,
                           ...rest
                       }) => {
    const classes = useStyles();
    const theme = useTheme();
    const chartRef = useRef()


    const [localColors, setLocalColors] = useState(colorsArray);
    const [data, setData] = useState(initialData);

    useEffect(() => {
        if (data.datasets.length) {
            setLocalColors([...colorsArray, ...data.datasets.map(() => randomColor())])
        }
    }, [group.categories, data.datasets.length])

    useEffect(() => {
        if (currentPoll) {
            setData({
                datasets: [
                    {
                        data: currentPoll.options.map(option => option.votes),
                        backgroundColor: localColors,
                        borderWidth: 8,
                        borderColor: theme.palette.common.white,
                        hoverBorderColor: theme.palette.common.white
                    }
                ],
                labels: currentPoll.options.map(option => convertStringToArray(option.name))
            })
        } else {
            setData(initialData)
        }

    }, [currentPoll])


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
            titleFontColor: theme.palette.text.primary,
            callbacks: {
                title: (tooltipItems, data) => {
                    return data.labels[tooltipItems[0].index]
                },
                label: () => " ",
            }
        },
        plugins: {
            labels: customDonutConfig
        },
    };

    const hasNoData = () => {
        return Boolean(!data.datasets.length)
    }

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <Divider/>
            <CardContent>
                <Box
                    height={300}
                    position="relative"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    {hasNoData() ?
                        <Typography>
                            Not enough {streamDataType.displayName.slice(0, -1)} data
                        </Typography>
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
                        options={currentPoll.options}
                        colors={localColors}
                        chartRef={chartRef}
                        fullWidth={false}
                        chartData={data}
                        optionDataType="Student"
                        optionValueProp="count"
                    />
                </Box>}
            </CardContent>
        </Card>
    );
};

FeedbackGraph.propTypes = {
    className: PropTypes.string
};

export default withFirebase(FeedbackGraph);
