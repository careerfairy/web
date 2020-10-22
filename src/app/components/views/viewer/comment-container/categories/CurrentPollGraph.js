import React, {useEffect, useRef, useState} from 'react';
import {Doughnut} from "react-chartjs-2";
import {Checkbox, List, ListItem, Typography} from "@material-ui/core";
import 'chartjs-plugin-labels'
import {Chart} from 'react-chartjs-2'
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

const formatLabel = (str, maxWidth) => {
    let sections = [];
    let words = str.split(" ");
    let temp = "";

    words.forEach(function (item, index) {
        if (temp.length > 0) {
            const concat = temp + ' ' + item;

            if (concat.length > maxWidth) {
                sections.push(temp);
                temp = "";
            } else {
                if (index === (words.length - 1)) {
                    sections.push(concat);
                    return;
                } else {
                    temp = concat;
                    return;
                }
            }
        }

        if (index === (words.length - 1)) {
            sections.push(item);
            return;
        }

        if (item.length < maxWidth) {
            temp = item;
        } else {
            sections.push(item);
        }

    });

    console.log("-> sections", sections);
    return [sections];
}

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
// const option = {name: "Our next product", voters: Array(1), votes: 1, index: 0}
const CurrentPollGraph = ({currentPoll: {options, question, timestamp, voters}}) => {
        const [legendLabels, setLegendLabels] = useState([])
        const [chartData, setChartData] = useState({
            labels: options.map(option => option.name, 20),
            datasets: [{
                label: question,
                data: options.map(option => option.votes),
                backgroundColor: options.map((option, index) => baseColors[index]),
                hoverBackgroundColor: options.map((option, index) => baseColors[index])
            }],
        })

        useEffect(() => {
            setLegendLabels(options.map(option => ({name: option.name, hidden: false})))
        }, [question])

        useEffect(() => {
            setChartData({
                labels: options.map(option => formatLabel(option.name, 20)),
                datasets: [{
                    label: question,
                    data: options.map(option => option.votes),
                    backgroundColor: options.map((option, index) => baseColors[index]),
                    hoverBackgroundColor: options.map((option, index) => baseColors[index])
                }],
            })
        }, [options])

        const chartRef = useRef(null)
        console.log("-> chartRef", chartRef);

        const chartWidth = chartRef?.current?.chartInstance.chartArea.right

        const getTotalVotes = (arr) => {
            return arr.reduce((acc, obj) => acc + obj.votes, 0); // 7
        }
        const renderLegendItems = () => {
            return chartRef?.current?.chartInstance?.legend?.legendItems || []
        }
        const handleClickLegend = (e, legendItem) => {
            var index = legendItem.index;
            var chart = chartRef?.current?.chartInstance;
            var i, ilen, meta;

            for (i = 0, ilen = (chart.data.datasets || []).length; i < ilen; ++i) {
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
            responsive: true,
            maintainAspectRatio: true,
            legend: {
                display: false,
            },
            plugins: {
                labels: [{
                    fontColor: 'white',
                    render: 'value',
                    fontStyle: 'bold',
                    arc: true,
                }]
            },
            cutoutPercentage: 70,
            elements: {
                center: {
                    text: `${getTotalVotes(options)} Votes`,
                    color: '#000000', // Default is #000000
                    fontStyle: 'Poppins', // Default is Arial
                    sidePadding: 20, // Default is 20 (as a percentage)
                    minFontSize: 45, // Default is 20 (in px), set to false and text will not wrap.
                    lineHeight: 40 // Default is 25 (in px), used for when text wraps
                }
            },
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
                        return '(' + percent + '%)';
                    }
                },
                // backgroundColor: '#FFF',
                // titleFontSize: 16,
                // titleFontColor: theme.palette.primary.main,
                // bodyFontColor: '#000',
                // bodyFontSize: 14,
                // displayColors: false,
                // borderColor: theme.palette.primary.main,
                // borderWidth: 3,
            }
        }

        return (
            <div style={{
                background: "rgb(240, 240, 240)",
                padding: 12,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Typography align="center" color="primary" style={{fontSize: "2.5em"}}
                            variant="h3"
                            gutterBottom>{question}</Typography>
                <List dense>
                    {renderLegendItems().map((item) => {
                        const votesNum = chartData.datasets[0].data[item.index]
                        return (
                            <ListItem dense key={item.index} onClick={(e) => handleClickLegend(e, item)} button>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        style={{color: item.fillStyle}}
                                        checked={!legendLabels[item.index].hidden}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{'aria-labelledby': item.text}}
                                    />
                                </ListItemIcon>
                                <ListItemText>
                                    {item.text}<strong> - {votesNum} Votes</strong>
                                </ListItemText>
                            </ListItem>
                        )
                    })}
                </List>
                <div style={{position: "relative", width: "100%"}}>
                    <Doughnut
                        data={chartData}
                        width={1}
                        height={1}
                        ref={chartRef}
                        options={optionsObj}/>
                    <div style={{
                        position: "absolute",
                        top: chartWidth / 2,
                        display: "flex",
                        paddingTop: "7%",
                        flexDirection: "column",
                        justifyContent: "center",
                        width: "100%",
                        height: chartWidth,
                        transform: "translateY(-50%)"
                    }}>
                        <Typography variant="h1" style={{fontWeight: 500, fontSize: "5.3rem", lineHeight: 0.6}} align="center">{getTotalVotes(options)}</Typography>
                        <Typography  variant="subtitle2" style={{fontSize: "2.4rem",  }} align="center">votes</Typography>
                    </div>
                </div>
            </div>
        )
            ;
    }
;

export default CurrentPollGraph;
