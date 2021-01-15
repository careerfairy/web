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
    useTheme, ListItem, Checkbox, List, SvgIcon
} from '@material-ui/core';
import {colorsArray} from "../../../../../util/colors";
import {withFirebase} from "../../../../../../context/firebase";
import Button from "@material-ui/core/Button";
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import {convertStringToArray} from "../../../../../helperFunctions/HelperFunctions";

import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import {OverlaySvg} from "../common/Overlays";

const useStyles = makeStyles(() => ({
    root: {
        height: '100%'
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
    const [total, setTotal] = useState(0);
    const [legendLabels, setLegendLabels] = useState([]);
    const [data, setData] = useState(initialData);

    useEffect(() => {
        if (data.datasets.length) {
            setLocalColors([...colorsArray, ...data.datasets.map(() => randomColor())])
        }
    }, [group.categories])

    useEffect(() => {
        if (currentPoll) {
            setData({
                datasets: [
                    {
                        data: currentPoll.options.map(option => option.votes),
                        backgroundColor: localColors,
                        borderWidth: 8,
                        borderColor: colors.common.white,
                        hoverBorderColor: colors.common.white
                    }
                ],
                labels: currentPoll.options.map(option => convertStringToArray(option.name))
            })
            setLegendLabels(currentPoll.options.map(option => ({name: option.name, hidden: false})))

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
            labels: [{
                fontColor: 'white',
                render: 'percent',
                fontStyle: 'bold',
                arc: true,
            }]
        },
    };

    const hasNoData = () => {
        return Boolean(!data.datasets.length)
    }
    const handleReset = () => {
        setCurrentStream(null)
        setUserType(userTypes[0])
    }

    const handleClickLegend = (e, legendItem) => {
        const index = legendItem.index;
        const chart = chartRef?.current?.chartInstance;
        let i, iLength, meta;
        for (i = 0, iLength = (chart.data.datasets || []).length; i < iLength; ++i) {
            meta = chart.getDatasetMeta(i);
            // toggle visibility of index if exists
            if (meta.data[index]) {
                meta.data[index].hidden = !meta.data[index].hidden;
                const newLabels = [...legendLabels]
                newLabels[index].hidden = meta.data[index].hidden
                setLegendLabels(newLabels)
            }
        }
        chart.update();
    }

    const active = () => {
        return Boolean(
            currentPoll
        )
    }

    return (
        <Card
            raised={active()}
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardHeader
                title={`${streamDataType.displayName.slice(0, -1)} Breakdown`}
                subheader={currentPoll?.question}
            />
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
                <List dense>
                    {currentPoll?.options.map(option => {
                        return (
                            <ListItem dense key={option.index} onClick={(e) => handleClickLegend(e, option)} button>
                                <ListItemIcon style={{minWidth: 0}}>
                                    <Checkbox
                                        edge="start"
                                        style={{color: colorsArray[option.index]}}
                                        checked={!legendLabels?.[option.index]?.hidden}
                                    />
                                </ListItemIcon>
                                <ListItemText>
                                    {option.name}
                                    <br/><strong>[{option.votes} Vote{option.votes !== 1 && "s"}]</strong>
                                </ListItemText>
                            </ListItem>)
                    })}
                </List>
                }
            </CardContent>
        </Card>
    );
};

FeedbackGraph.propTypes = {
    className: PropTypes.string
};

export default withFirebase(FeedbackGraph);
