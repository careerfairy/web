import React, {useEffect, useState} from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {Bar} from "react-chartjs-2";
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
                          firebase,
                          mostRecentEvents,
                          currentTimeFrame,
                          group,
                          className,
                          ...rest
                      }) => {
    const classes = useStyles();
    const theme = useTheme();

    const [localStreams, setLocalStreams] = useState([]);
    const [anchorEl, setAnchorEl] = React.useState(null);


    useEffect(() => {
        setLocalStreams(mostRecentEvents)
    }, [mostRecentEvents])

    useEffect(() => {
        if (mostRecentEvents.length) {
            // setParticipatingStudents(mostRecentEvents)
            // setTalentPool(mostRecentEvents)
        }
    }, [mostRecentEvents])


    const data = {
        datasets: [
            {
                backgroundColor: colorsArray[0],
                data: getLength(localStreams, "registeredUsers"),
                label: "Registrations",
            },
            {
                backgroundColor: colorsArray[1],
                data: getLength(localStreams, "participatingStudents"),
                label: "Participation",
            },
            {
                backgroundColor: colorsArray[2],
                data: getLength(localStreams, "talentPool"),
                label: "Talent Pool",
            },
        ],
        labels: localStreams.map(event => [`${event.company} `, `${prettyDate(event.start)}`, event.id]),
    }

    const options = {
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
                        }
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
                    return data.labels[tooltipItems[0].index].slice(0, -1)
                },
                label: (tooltipItems, data) => {
                    return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.value
                }
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

    const setParticipatingStudents = async (mostRecentEvents) => {
        const streamsWithParticipation = [...mostRecentEvents]
        for (const livestream of streamsWithParticipation) {
            const snapData = await firebase.getLivestreamParticipatingStudents(livestream.id)
            livestream.participatingStudents = snapShotsToData(snapData)
        }
        return setLocalStreams(prevState => {
            // Merges the original array of objects with the updated array of object with NEW properties
            return prevState.map((item, i) => Object.assign({}, item, streamsWithParticipation[i]))
        })
    }
    const setTalentPool = async (mostRecentEvents) => {
        const streamsWithTalentPool = [...mostRecentEvents]
        for (const livestream of streamsWithTalentPool) {
            const snapData = await firebase.getLivestreamTalentPoolMembers(livestream.companyId)
            livestream.talentPool = snapShotsToData(snapData)
        }
        setLocalStreams(prevState => {
            // Merges the original array of objects with the updated array of object with NEW properties
            return prevState.map((item, i) => Object.assign({}, item, streamsWithTalentPool[i]))
        })
    }

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
                    <Bar data={data} options={options}/>
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
