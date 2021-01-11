import React from 'react';
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
    colors,
    makeStyles,
    useTheme
} from '@material-ui/core';
import LaptopMacIcon from '@material-ui/icons/LaptopMac';
import PhoneIcon from '@material-ui/icons/Phone';
import TabletIcon from '@material-ui/icons/Tablet';
import {colorsArray} from "../../../../util/colors";
import {withFirebase} from "../../../../../context/firebase";

const useStyles = makeStyles(() => ({
    root: {
        height: '100%'
    }
}));

function randomColor() {
    var max = 0xffffff;
    return '#' + Math.round(Math.random() * max).toString(16);
}

const TypeOfParticipants = ({currentStream, typesOfOptions, timeFrames, className, ...rest}) => {
    const classes = useStyles();
    const theme = useTheme();

    const data = {
        datasets: [
            {
                data: typesOfOptions.map(option => option.count),
                backgroundColor: typesOfOptions.map(() => randomColor()),
                borderWidth: 8,
                borderColor: colors.common.white,
                hoverBorderColor: colors.common.white
            }
        ],
        labels: typesOfOptions.map(option => option.name)
    };

    const options = {
        // animation: false,
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
        }
    };

    const devices = [
        {
            title: 'Physics',
            value: 63,
            icon: LaptopMacIcon,
            color: colorsArray[0],
        },
        {
            title: 'Consulting',
            value: 15,
            icon: TabletIcon,
            color: colorsArray[1]
        },
        {
            title: 'Environmental Studies',
            value: 23,
            icon: PhoneIcon,
            color: colorsArray[2]
        }
    ];

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardHeader title="Most Common Participants" subheader={`That attended ${currentStream.company}`}/>
            <Divider/>
            <CardContent>
                <Box
                    height={300}
                    position="relative"
                >
                    <Doughnut
                        data={data}
                        options={options}
                    />
                </Box>
                <Box
                    display="flex"
                    justifyContent="center"
                    mt={2}
                >
                    {devices.map(({
                                      color,
                                      icon: Icon,
                                      title,
                                      value
                                  }) => (
                        <Box
                            key={title}
                            p={1}
                            textAlign="center"
                            display="flex"
                            flexDirection="column"
                            justifyContent="space-between"
                        >
                            {/*<Icon color="action" />*/}
                            <Typography
                                color="textPrimary"
                                variant="body1"
                            >
                                {title}
                            </Typography>
                            <Typography
                                style={{color}}
                                variant="h2"
                            >
                                {value}
                                %
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

TypeOfParticipants.propTypes = {
    className: PropTypes.string
};

export default withFirebase(TypeOfParticipants);
