import React, {useEffect, useRef, useState} from 'react';
import {Doughnut} from "react-chartjs-2";
import {Checkbox, List, ListItem, Typography, useTheme} from "@material-ui/core";
import 'chartjs-plugin-labels'
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

const baseColors = [
    '#E74C3C',
    '#E67E22',
    '#FFCE56',
    '#27AE60',
    '#145A32',
    '#36A2EB',
    '#8E44AD',
    '#B7950B',
]

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
                    backgroundColor: options.map((option, index) => baseColors[index]),
                    hoverBackgroundColor: options.map((option, index) => baseColors[index])
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
                }
            }
        }

        return (
            <div style={{
                background: background,
                padding: 12,
                height: "100%",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
            }}>
                <Typography align="center" color="primary" style={{fontSize: "2em", marginTop: "auto", overflowWrap: "break-word"}}
                            variant="h4"
                            gutterBottom>{question}</Typography>
                <List dense>
                    {legendElements.map((item) => {
                        const votesNum = chartData.datasets[0].data[item.index]
                        return (
                            <ListItem style={{paddingRight: 0}} dense key={item.index} onClick={(e) => handleClickLegend(e, item)} button>
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
                    })}
                </List>
                <div style={{position: "relative", width: "100%", marginBottom: "auto"}}>
                    <Doughnut
                        data={chartData}
                        ref={chartRef}
                        width={100}
                        height={100}
                        options={optionsObj}/>
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        right: "50%",
                        borderRadius: "50%",
                        zIndex: 1,
                        transform: "translateY(-50%) translateX(50%)"
                    }}>
                        <Typography variant="h2" style={{fontWeight: 500, lineHeight: 0.6}}
                                    align="center">{getTotalVotes(options)}</Typography>
                        <Typography variant="h6" align="center">vote{getTotalVotes(options) !== 1 && "s"}</Typography>
                    </div>
                </div>
            </div>
        )
            ;
    }
;

export default CurrentPollGraph;
