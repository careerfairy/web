import React, {useEffect, useState} from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {Bar, Line} from "react-chartjs-2";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    useTheme,
    makeStyles, Menu, MenuItem,
} from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import {withFirebase} from "../../../../../context/firebase";
import {colorsArray} from "../../../../util/colors";
import {getLength, prettyDate, snapShotsToData} from "../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
    root: {},
    select: {
        backgroundColor: theme.palette.background.paper,
    }
}));


const LatestEvents = ({
                          timeFrames,
                          setCurrentTimeFrame,
                          futureStreams,
                          firebase,
                          mostRecentEvents,
                          currentTimeFrame,
                          setCurrentStream,
                          group,
                          className,
                          ...rest
                      }) => {
    const classes = useStyles();
    const theme = useTheme();

    const [anchorEl, setAnchorEl] = React.useState(null);


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
            return [...getLength(mostRecentEvents, prop),
                // , futureStreams[0][prop].length,
                ...Array(futureStreams.length).fill(undefined)
                // ...Array(futureStreams.length - 1).fill(undefined)
            ]
        } else {
            return [...getLength(mostRecentEvents, prop)]
        }
    }
    const handleFutureStreams = (prop) => {
        if (mostRecentEvents.length) {
            return [...Array(mostRecentEvents.length).fill(undefined), ...getLength(futureStreams, prop)]
            // return [...Array(mostRecentEvents.length - 1).fill(undefined), mostRecentEvents[mostRecentEvents.length - 1][prop].length, ...getLength(futureStreams, prop)]
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
                borderDash: [20, 30],
                pointHoverBackgroundColor: colorsArray[0],
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointBorderColor: colorsArray[0],
                pointBackgroundColor: colorsArray[0],
                backgroundColor: theme.palette.primary.dark,
                borderColor: colorsArray[0],
                data: handleFutureStreams("registeredUsers"),
                label: "Future Registrations",
                spanGaps: true
            },
            {
                borderDash: [20, 30],
                pointHoverBackgroundColor: colorsArray[1],
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointBorderColor: colorsArray[1],
                pointBackgroundColor: colorsArray[1],
                backgroundColor: colorsArray[1],
                borderColor: colorsArray[1],
                data: handleFutureStreams("participatingStudents"),
                label: "Future Participation",
                spanGaps: true
            },
            {
                borderDash: [20, 30],
                pointHoverBackgroundColor: colorsArray[2],
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointBorderColor: colorsArray[2],
                pointBackgroundColor: colorsArray[2],
                backgroundColor: colorsArray[2],
                borderColor: colorsArray[2],
                data: handleFutureStreams("talentPool"),
                label: "Future Talent Pool",
                spanGaps: true
            },
        ],
        labels: [...mostRecentEvents, ...futureStreams].map(event => [`${event.company} `, `${prettyDate(event.start)}`, event.id]),
    }
    // console.log("-> mostRecentEvents", mostRecentEvents);
    // console.log("-> futureStreams", futureStreams);
    // console.log("-> data.datasets[2", data.datasets[2].data, data.datasets[2].label);
    // console.log("-> data.datasets[3", data.datasets[5].data, data.datasets[5].label);


    const options = {
        onHover: (event, chartElement) => {
            if (chartElement.length) {
                const index = chartElement[0]._index
                if (mostRecentEvents[index]?.participatingStudents?.length) {
                    event.target.style.cursor = chartElement[0] ? 'pointer' : 'default'
                }
            }
        },
        onClick: (event, chartElement, data) => {
            if (chartElement.length) {
                const index = chartElement[0]._index
                if (mostRecentEvents[index]?.participatingStudents?.length) {
                    setCurrentStream(mostRecentEvents[index])
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
                    return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.value
                },
                afterTitle: (tooltipItem, data) => {
                    if (tooltipItem.length) {
                        const index = tooltipItem[0].index
                        if (mostRecentEvents[index]?.participatingStudents.length) {
                            return "Click for breakdown"
                        }
                    }
                },

            }
        },
    };


    const handleClickListItem = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (event, index) => {
        setCurrentTimeFrame(timeFrames[index])
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


    return (
        <Card className={clsx(classes.root, className)} {...rest}>
            <CardHeader
                action={
                    <div>
                        <Button onClick={handleClickListItem} endIcon={<ArrowDropDownIcon/>} size="small"
                                variant="text">
                            {`In the last ${currentTimeFrame.pastName}`}
                        </Button>
                        <Menu
                            id="lock-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            {timeFrames.map((option, index) => (
                                <MenuItem
                                    key={option.id}
                                    selected={option.id === currentTimeFrame.id}
                                    onClick={(event) => handleMenuItemClick(event, index)}
                                >
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Menu>
                    </div>
                }
                title="Latest Events"
            />
            <Divider/>
            <CardContent>
                <Box height={400}>
                    <Line data={data} options={options}/>
                </Box>
            </CardContent>
            <Divider/>
            <Box display="flex" justifyContent="flex-end" p={2}>
                <Button
                    color="primary"
                    endIcon={<ArrowRightIcon/>}
                    size="small"
                    variant="text"
                >
                    Overview
                </Button>
            </Box>
        </Card>
    );
};

LatestEvents.propTypes = {
    className: PropTypes.string,
};

export default withFirebase(LatestEvents);
