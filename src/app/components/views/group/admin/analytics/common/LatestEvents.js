import React, {useEffect, useState} from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {Bar, Doughnut, Line} from "react-chartjs-2";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    useTheme,
    makeStyles, Menu, MenuItem, CircularProgress, fade, FormControlLabel, Switch,
} from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import {withFirebase} from "../../../../../../context/firebase";
import {colorsArray} from "../../../../../util/colors";
import {getLength, prettyDate, snapShotsToData} from "../../../../../helperFunctions/HelperFunctions";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

const useStyles = makeStyles((theme) => ({
    root: {},
    select: {
        backgroundColor: theme.palette.background.paper,
    }
}));


const LatestEvents = ({
                          timeFrames,
                          isFeedback,
                          futureStreams,
                          firebase,
                          setUserType,
                          streamsFromTimeFrame,
                          group,
                          className,
                          userTypes,
                          userType,
                          setCurrentStream,
                          fetchingStreams,
                          showBar,
                          handleToggleBar,
                          ...rest
                      }) => {
    const classes = useStyles();
    const theme = useTheme();


    const lineConfig = {
        fill: false,
        lineTension: 0.1,
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        spanGaps: true,
    }

    const handlePastStreams = (prop) => {
        if (futureStreams.length) {
            return [...getLength(streamsFromTimeFrame, prop),
                ...Array(futureStreams.length).fill(undefined)
            ]
        } else {
            return [...getLength(streamsFromTimeFrame, prop)]
        }
    }
    const handleFutureStreams = (prop) => {
        if (streamsFromTimeFrame.length) {
            return [...Array(streamsFromTimeFrame.length).fill(undefined), ...getLength(futureStreams, prop)]
        } else {
            return [...getLength(futureStreams, prop)]
        }
    }


    const data = {
        datasets: [
            {
                pointHoverBackgroundColor: colorsArray[0],
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointBorderColor: colorsArray[0],
                pointBackgroundColor: colorsArray[0],
                backgroundColor: theme.palette.primary.dark,
                borderColor: colorsArray[0],
                data: handlePastStreams("registeredUsers"),
                label: "Registrations",
                ...lineConfig
            },
            {
                pointHoverBackgroundColor: colorsArray[1],
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointBorderColor: colorsArray[1],
                pointBackgroundColor: colorsArray[1],
                backgroundColor: colorsArray[1],
                borderColor: colorsArray[1],
                data: handlePastStreams("participatingStudents"),
                label: "Participation",
                ...lineConfig
            },
            {
                pointHoverBackgroundColor: colorsArray[2],
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointBorderColor: colorsArray[2],
                pointBackgroundColor: colorsArray[2],
                backgroundColor: colorsArray[2],
                borderColor: colorsArray[2],
                data: handlePastStreams("talentPool"),
                label: "Talent Pool",
                ...lineConfig
            },
            {
                borderDash: [5, 5],
                pointHoverBackgroundColor: colorsArray[0],
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointBorderColor: colorsArray[0],
                pointBackgroundColor: colorsArray[0],
                backgroundColor: theme.palette.primary.dark,
                borderColor: fade(colorsArray[0], 0.5),
                data: handleFutureStreams("registeredUsers"),
                label: "Registrations (future)",
                spanGaps: true
            },
            {
                borderDash: [5, 5],
                pointHoverBackgroundColor: colorsArray[4],
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointBorderColor: colorsArray[2],
                pointBackgroundColor: colorsArray[2],
                backgroundColor: colorsArray[2],
                borderColor: fade(colorsArray[2], 0.5),
                data: handleFutureStreams("talentPool"),
                label: "Talent Pool (future)",
                spanGaps: true
            },
        ],
        labels: [...streamsFromTimeFrame, ...futureStreams].map(event => [`${event.company} `, `${prettyDate(event.start)}`, event.id]),
    }


    const options = {
        onHover: (event, chartElement) => {
            if (chartElement.length) {
                const index = chartElement[0]._index
                if ([...streamsFromTimeFrame, ...futureStreams][index]?.[userType.propertyName]?.length) {
                    event.target.style.cursor = 'pointer'
                } else {
                    event.target.style.cursor = 'default'
                }
            }
        },
        onClick: (event, chartElement, data) => {
            if (chartElement.length) {
                const index = chartElement[0]._index
                if ([...streamsFromTimeFrame, ...futureStreams][index]) {
                    setCurrentStream([...streamsFromTimeFrame, ...futureStreams][index])
                }
            }
        },
        elements: {
            line: {
                fill: false,
                tension: 0
            }
        },
        redraw: true,
        cornerRadius: 20,
        layout: {padding: 0},
        legend: {display: true},
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            xAxes: [
                {
                    barThickness: 12,
                    maxBarThickness: 10,
                    barPercentage: 0.5,
                    categoryPercentage: 0.5,
                    ticks: {
                        fontColor: theme.palette.text.secondary,
                        maxTicksLimit: 15,
                        callback: function (value, index, values) {
                            return value[0]
                        },
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false,
                    },

                },
            ],
            yAxes: [
                {
                    ticks: {
                        fontColor: theme.palette.text.secondary,
                        beginAtZero: true,
                        min: 0,
                    },
                    gridLines: {
                        borderDash: [2],
                        borderDashOffset: [2],
                        color: theme.palette.divider,
                        drawBorder: false,
                        zeroLineBorderDash: [2],
                        zeroLineBorderDashOffset: [2],
                        zeroLineColor: theme.palette.divider,
                    },
                },
            ],
        },
        tooltips: {
            backgroundColor: theme.palette.background.default,
            bodyFontColor: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            borderWidth: 1,
            enabled: true,
            footerFontColor: theme.palette.text.secondary,
            intersect: false,
            mode: "index",
            titleFontColor: theme.palette.text.primary,
            callbacks: {
                title: (tooltipItems, data) => {
                    return data.labels[tooltipItems[0].index]?.slice(0, -1)
                },
                label: (tooltipItems, data) => {
                    if (!isNaN(tooltipItems.value)) {
                        return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.value
                    }
                },
                afterTitle: (tooltipItem, data) => {
                    if (tooltipItem.length) {
                        const index = tooltipItem[0].index
                        if ([...streamsFromTimeFrame, ...futureStreams][index]?.[userType.propertyName]?.length) {
                            return "Click for breakdown"
                        }
                    }
                },

            }
        },
    };

    const handleMenuItemClick = (event, index) => {
        setUserType(userTypes[index])
    };


    return (
        <Card className={clsx(classes.root, className)} {...rest}>
            <CardHeader
                action={
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showBar}
                                onChange={handleToggleBar}
                                name="barToggle"
                                color="primary"
                            />
                        }
                        label={`Make Bar Chart`}
                    />
                }
                title="Latest Events"
            />
            {!isFeedback &&
            <>
                <Divider/>
                <Tabs
                    value={userType.propertyName}
                    indicatorColor="primary"
                    textColor="primary"
                    scrollButtons="auto"
                    aria-label="disabled tabs example"
                >
                    {userTypes.map(({displayName, propertyName}, index) => (
                        <Tab
                            key={propertyName}
                            value={propertyName}
                            onClick={(event) => handleMenuItemClick(event, index)}
                            label={displayName}
                        />
                    ))}
                </Tabs>
            </>}
            <Divider/>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="center" height={400}>
                    {fetchingStreams ? <CircularProgress size={50}/> : (showBar ? <Bar data={data} options={options}/> :
                        <Line data={data} options={options}/>)}
                </Box>
            </CardContent>
        </Card>
    );
}
;

LatestEvents.propTypes =
{
    className: PropTypes.string,
}
;

export default withFirebase(LatestEvents);
