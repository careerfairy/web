import React, {useEffect, useRef, useState} from 'react';
import {Doughnut} from "react-chartjs-2";
import {Box, Checkbox, List, ListItem, Typography, withStyles} from "@material-ui/core";
import 'chartjs-plugin-labels'
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {PollQuestion} from "../../../../materialUI/GlobalTitles";
import {colorsArray} from "../../../util/colors";

const GraphWrapper = withStyles(theme => ({
    root: {
        width: "inherit",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
    },
}))(Box);

const CountWrapper = withStyles(theme => ({
    root: {
        position: "absolute",
        top: "50%",
        right: "50%",
        borderRadius: "50%",
        zIndex: 1,
        transform: "translateY(-50%) translateX(50%)"
    },
}))(Box);

const CurrentPollGraph = ({currentPoll: {options, question}, background}) => {
    const chartRef = useRef()
    const [legendElements, setLegendElements] = useState([])
    const [legendLabels, setLegendLabels] = useState([])
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    })

    useEffect(() => {
        setLegendLabels(options.map(option => ({name: option.name, hidden: false})))
    }, [question])

    useEffect(() => {
        setChartData({
            labels: options.map(option => option.name),
            datasets: [{
                label: question,
                data: options.map(option => option.votes),
                backgroundColor: options.map((option, index) => colorsArray[index]),
                hoverBackgroundColor: options.map((option, index) => colorsArray[index])
            }],
        })
    }, [options])

    useEffect(() => {
        if (chartRef.current) {
            setLegendElements(chartRef.current.chartInstance.legend.legendItems)
        }

    }, [chartRef.current])

    const getTotalVotes = (arr) => {
        return arr.reduce((acc, obj) => acc + obj.votes, 0); // 7
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

    const optionsObj = {
        maintainAspectRatio: true,
        legend: {
            display: false,
        },
        plugins: {
            labels: [{
                fontColor: 'white',
                render: 'value',
                fontStyle: 'bold',
                arc: false,
            }]
        },
        cutoutPercentage: 70,
        redraw: true,
        tooltips: {
            callbacks: {
                title: (tooltipItem, data) => {
                    return data['labels'][tooltipItem[0]['index']];
                },
                label: (tooltipItem, data) => {
                    return data['datasets'][0]['data'][tooltipItem['index']] + " votes";
                },
                afterLabel: (tooltipItem, data) => {
                    const dataset = data['datasets'][0];
                    const percent = Math.round((dataset['data'][tooltipItem['index']] / dataset["_meta"][0]?.['total']) * 100)
                    return isNaN(percent) ? "" : '(' + percent + '%)';
                }
            },
            enabled: false
        }
    }

    const renderLegendElements = legendElements.map((item) => {
        const votesNum = chartData.datasets[0].data[item.index]
        return (
            <ListItem dense key={item.index} onClick={(e) => handleClickLegend(e, item)} button>
                <ListItemIcon style={{minWidth: 0}}>
                    <Checkbox
                        edge="start"
                        style={{color: item.fillStyle}}
                        checked={!legendLabels[item.index].hidden}
                    />
                </ListItemIcon>
                <ListItemText>
                    {item.text} <br/><strong>[{votesNum} Vote{votesNum !== 1 && "s"}]</strong>
                </ListItemText>
            </ListItem>
        )
    })

    return (
        <GraphWrapper>
            <PollQuestion style={{marginTop: "auto", padding: "0 0.5rem"}}>
                {question}
            </PollQuestion>
            <List dense>
                {renderLegendElements}
            </List>
            <div style={{position: "relative", marginBottom: "auto", padding: "0 0.5rem"}}>
                <Doughnut
                    data={chartData}
                    ref={chartRef}
                    width={100}
                    height={100}
                    options={optionsObj}/>
                <CountWrapper>
                    <Typography variant="h2" style={{fontWeight: 500, lineHeight: 0.6}}
                                align="center">{getTotalVotes(options)}</Typography>
                    <Typography variant="h6" align="center">vote{getTotalVotes(options) !== 1 && "s"}</Typography>
                </CountWrapper>
            </div>
        </GraphWrapper>
    )
}


export default CurrentPollGraph;
