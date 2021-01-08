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
    makeStyles,
    colors,
} from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import {withFirebase} from "../../../../../context/firebase";
import {colorsArray} from "../../../../util/colors";

const useStyles = makeStyles(() => ({
    root: {},
}));

const LatestEvents = ({firebase, mostRecentEvents, timeFrames, className, ...rest}) => {
    const classes = useStyles();
    const theme = useTheme();
    const [localEvents, setLocalEvents] = useState(mostRecentEvents);
    console.log("-> mostRecentEvents", mostRecentEvents);
    // console.log("-> localEvents", localEvents);

    useEffect(() => {
        (async function cloneStreamsAndGetAdditionalData () {
            if (mostRecentEvents?.length) {
                const newLocalEvents = [...localEvents]
                for (stream of newLocalEvents) {
                    if (!stream.talentPoolData) {
                        const talentPoolData = await firebase.getLivestreamTalentPoolMembers(stream.companyId)
                        console.log("-> talentPoolData", talentPoolData);
                        console.log("-> talentPoolData.get(", talentPoolData.data());
                    }
                }

            }
        })()
    }, [mostRecentEvents])

    const data = {
        datasets: [
            {
                backgroundColor: colorsArray[0],
                data: mostRecentEvents.map(event => event.registeredUsers?.length),
                label: "Registrations",
            },
            // {
            //     backgroundColor: colorsArray[1],
            //     data: [111, 202, 124, 292, 304, 255, 134, 271, 293, 191, 207],
            //     label: "Participation",
            // },
            // {
            //     backgroundColor: colorsArray[2],
            //     data: [34, 78, 45, 123, 87, 45, 31, 271, 293, 191, 207],
            //     label: "Talent Pool",
            // },
        ],
        labels: mostRecentEvents.map(event => event.company),
    };

    const options = {
        // animation: false,
        cornerRadius: 20,
        layout: {padding: 0},
        legend: {display: false},
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
        },
    };

    return (
        <Card className={clsx(classes.root, className)} {...rest}>
            <CardHeader
                action={
                    <Button endIcon={<ArrowDropDownIcon/>} size="small" variant="text">
                        Last 7 days
                    </Button>
                }
                title="Latest Events"
                // subheader="first bar registrations, second bar particip, third talent pool"
            />
            <Divider/>
            <CardContent>
                <Box height={400} position="relative">
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
