import React, {useEffect, useState} from 'react';
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
    useTheme
} from '@material-ui/core';
import LaptopMacIcon from '@material-ui/icons/LaptopMac';
import PhoneIcon from '@material-ui/icons/Phone';
import TabletIcon from '@material-ui/icons/Tablet';
import {colorsArray} from "../../../../../util/colors";
import {withFirebase} from "../../../../../../context/firebase";
import Button from "@material-ui/core/Button";
import RotateLeftIcon from '@material-ui/icons/RotateLeft';

const useStyles = makeStyles(() => ({
    root: {
        height: '100%'
    }
}));

function randomColor() {
    var max = 0xffffff;
    return '#' + Math.round(Math.random() * max).toString(16);
}

const TypeOfParticipants = ({
                                group,
                                setCurrentStream,
                                currentStream,
                                typesOfOptions,
                                className,
                                ...rest
                            }) => {
    const classes = useStyles();
    const theme = useTheme();

    const [localColors, setLocalColors] = useState(colorsArray);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (group.categories?.length) {
            setLocalColors([...colorsArray, ...typesOfOptions.map(() => randomColor())])
        }
    }, [group.categories])

    useEffect(() => {
        if (typesOfOptions.length) {
            const totalCount = typesOfOptions.reduce((acc, curr) => {
                return acc + curr.count
            }, 0)
            setTotal(totalCount)
        }
    }, [typesOfOptions])

    useEffect(() => {
        if (hasNoData()) {
            setCurrentStream(null)
        }
    }, [total])

    const data = {
        datasets: [
            {
                data: typesOfOptions.map(option => option.count),
                backgroundColor: localColors,
                borderWidth: 8,
                borderColor: colors.common.white,
                hoverBorderColor: colors.common.white
            }
        ],
        labels: typesOfOptions.map(option => option.name)
    };

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
        }
    };

    const getPercentage = (count) => {
        const percentage = Math.round((count / total) * 100)
        return percentage + "%"
    }

    const hasNoData = () => {
        return Boolean(typesOfOptions.length && total === 0)
    }

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardHeader
                title="Most Common Participants"
                subheader={currentStream ? `That attended ${currentStream.company}` : "on average"}
                action={
                    currentStream &&
                    <Button size="small"
                            variant="text"
                            onClick={() => setCurrentStream(null)}
                            endIcon={<RotateLeftIcon/>}
                    >
                        Reset
                    </Button>
                }
            />
            <Divider/>
            <CardContent>
                <Box
                    height={300}
                    position="relative"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    {hasNoData() ?
                        <Typography>
                            No data
                        </Typography>
                        :
                        <Doughnut
                            data={data}
                            options={options}
                        />}
                </Box>
                {!hasNoData() &&
                <Box
                    display="flex"
                    justifyContent="center"
                    mt={2}
                >
                    {typesOfOptions.slice(0, 3).map(({
                                                         name,
                                                         count,
                                                         id
                                                     }, index) => (
                        <Box
                            key={id}
                            p={1}
                            textAlign="center"
                            display="flex"
                            flexDirection="column"
                            justifyContent="space-between"
                        >
                            <Typography
                                color="textPrimary"
                                variant="body1"
                            >
                                {name}
                            </Typography>
                            <Typography
                                style={{color: localColors[index]}}
                                variant="h3"
                            >
                                {getPercentage(count)}
                            </Typography>
                        </Box>
                    ))}
                </Box>}
            </CardContent>
        </Card>
    );
};

TypeOfParticipants.propTypes = {
    className: PropTypes.string
};

export default withFirebase(TypeOfParticipants);
