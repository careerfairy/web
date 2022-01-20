import React, { useEffect, useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import "chartjs-plugin-labels";
import {
   Box,
   Checkbox,
   List,
   ListItem,
   ListItemIcon,
   ListItemText,
   Typography,
} from "@mui/material";
import { PollQuestion } from "../../../../materialUI/GlobalTitles";
import { colorsArray } from "../../../util/colors";
import { useTheme } from "@mui/material/styles";
import { withFirebase } from "../../../../context/firebase";
import { useCurrentStream } from "../../../../context/stream/StreamContext";
import useMapPollVoters from "../../../custom-hook/useMapPollVoters";
import useStreamRef from "../../../custom-hook/useStreamRef";

const CurrentPollGraph = ({
   currentPoll: { options, question, id: pollId, demoVotes },
   firebase,
}) => {
   const chartRef = useRef();
   const theme = useTheme();
   const streamRef = useStreamRef();
   const { currentLivestream } = useCurrentStream();
   const [legendElements, setLegendElements] = useState([]);
   const [legendLabels, setLegendLabels] = useState([]);
   const [chartData, setChartData] = useState({
      labels: [],
      datasets: [],
   });
   const [optionsObj, setOptionsObj] = useState({
      maintainAspectRatio: true,
      legend: {
         display: false,
      },
      cutoutPercentage: 70,
      redraw: true,
      tooltips: {
         callbacks: {
            title: (tooltipItem, data) => {
               return data["labels"][tooltipItem[0]["index"]];
            },
            label: (tooltipItem, data) => {
               return (
                  data["datasets"][0]["data"][tooltipItem["index"]] + " votes"
               );
            },
            afterLabel: (tooltipItem, data) => {
               const dataset = data["datasets"][0];
               const percent = Math.round(
                  (dataset["data"][tooltipItem["index"]] /
                     dataset["_meta"][0]?.["total"]) *
                     100
               );
               return isNaN(percent) ? "" : "(" + percent + "%)";
            },
         },
         enabled: false,
      },
   });

   useMapPollVoters(
      pollId,
      currentLivestream.id,
      setChartData,
      firebase,
      demoVotes,
      streamRef
   );

   useEffect(() => {
      setOptionsObj({
         ...optionsObj,
         plugins: {
            labels: [
               {
                  fontColor: "white",
                  render: "value",
                  fontStyle: "bold",
                  arc: false,
               },
            ],
         },
      });
   }, []);

   useEffect(() => {
      setLegendLabels(
         options.map((option) => ({
            name: option.text,
            hidden: false,
            id: option.id,
         }))
      );
   }, [question]);

   useEffect(() => {
      setChartData({
         labels: options.map((option) => option.text),
         ids: options.map((option) => option.id),
         datasets: [
            {
               label: question,
               data: options.map(() => 0),
               backgroundColor: options.map(
                  (option, index) => colorsArray[index]
               ),
               hoverBackgroundColor: options.map(
                  (option, index) => colorsArray[index]
               ),
               borderColor: theme.palette.background.paper,
            },
         ],
      });
   }, [pollId, theme.palette.mode]);

   useEffect(() => {
      if (chartRef.current) {
         setLegendElements(chartRef.current.chartInstance.legend.legendItems);
      }
   }, [chartRef.current]);

   const getTotalVotes = () => {
      return (
         chartData?.datasets?.[0]?.data.reduce(
            (acc, numVotes) => acc + numVotes,
            0
         ) || 0
      );
   };

   const handleClickLegend = (e, legendItem) => {
      const index = legendItem.index;
      const chart = chartRef?.current?.chartInstance;
      let i, iLength, meta;
      for (
         i = 0, iLength = (chart.data.datasets || []).length;
         i < iLength;
         ++i
      ) {
         meta = chart.getDatasetMeta(i);
         // toggle visibility of index if exists
         if (meta.data[index]) {
            meta.data[index].hidden = !meta.data[index].hidden;
            const newLabels = [...legendLabels];
            newLabels[index].hidden = meta.data[index].hidden;
            setLegendLabels(newLabels);
         }
      }
      chart.update();
   };

   const renderLegendElements = legendElements.map((item) => {
      const votesNum = chartData.datasets[0].data[item.index];
      return (
         <ListItem
            dense
            key={item.index}
            onClick={(e) => handleClickLegend(e, item)}
            button
         >
            <ListItemIcon style={{ minWidth: 0 }}>
               <Checkbox
                  edge="start"
                  style={{ color: item.fillStyle }}
                  checked={!legendLabels[item.index].hidden}
               />
            </ListItemIcon>
            <ListItemText style={{ wordBreak: "break-word" }}>
               {item.text} <br />
               <strong>
                  [{votesNum} Vote{votesNum !== 1 && "s"}]
               </strong>
            </ListItemText>
         </ListItem>
      );
   });

   return (
      <Box
         sx={{
            width: "inherit",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
         }}
      >
         <PollQuestion style={{ marginTop: "auto", padding: "0 1rem" }}>
            {question}
         </PollQuestion>
         <List dense>{renderLegendElements}</List>
         <div
            style={{
               position: "relative",
               marginBottom: "auto",
               padding: "1rem 2rem",
            }}
         >
            <Doughnut
               data={chartData}
               ref={chartRef}
               width={1}
               height={1}
               options={optionsObj}
            />
            <Box
               sx={{
                  position: "absolute",
                  top: "50%",
                  right: "50%",
                  borderRadius: "50%",
                  zIndex: 1,
                  transform: "translateY(-50%) translateX(50%)",
               }}
            >
               <Typography
                  variant="h3"
                  style={{
                     fontWeight: 500,
                     lineHeight: 0.6,
                     marginBottom: "10px",
                  }}
                  align="center"
               >
                  {getTotalVotes()}
               </Typography>
               <Typography variant="h6" align="center">
                  vote{getTotalVotes() !== 1 && "s"}
               </Typography>
            </Box>
         </div>
      </Box>
   );
};

export default withFirebase(CurrentPollGraph);
