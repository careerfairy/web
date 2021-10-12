import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Checkbox,
   Collapse,
   List,
   ListItem,
   Slide,
   ListItemIcon,
   ListItemText,
} from "@material-ui/core";
import { colorsArray } from "../../components/util/colors";
import { TransitionGroup } from "react-transition-group";

const useStyles = makeStyles((theme) => ({
   list: {
      width: ({ fullWidth }) => fullWidth && "100%",
      transition: theme.transitions.create("min-height", {
         easing: theme.transitions.easing.sharp,
         duration: theme.transitions.duration.leavingScreen,
      }),
   },
}));

const CustomLegend = ({
   chartRef = useRef(),
   options = [],
   colors = colorsArray,
   optionValueProp = "votes",
   optionLabelProp = "name",
   optionDataType = "Vote",
   fullWidth = false,
   chartData = {},
   hideEmpty,
}) => {
   const classes = useStyles({ fullWidth });
   const [legendLabels, setLegendLabels] = useState([]);

   useEffect(() => {
      const chart = chartRef?.current?.chartInstance;
      if (chart) {
         let totalLegends = [];
         chart.data.datasets.forEach((dataSet, dataSetIndex) => {
            const meta = chart.getDatasetMeta(dataSetIndex);
            const newLegends = meta.data.map((labelMetaData) => {
               return {
                  [optionLabelProp]: labelMetaData._view.label,
                  hidden: labelMetaData.hidden,
                  [optionValueProp]: dataSet.data[labelMetaData._index],
                  index: labelMetaData._index,
               };
            });
            totalLegends.push(...newLegends);
         });

         if (hideEmpty) {
            totalLegends = totalLegends.filter(
               (legend) => legend[optionValueProp]
            );
         }
         setLegendLabels(totalLegends);
      }
   }, [chartData, colors.length, hideEmpty]);

   const handleClickLegend = (e, index) => {
      const chart = chartRef?.current?.chartInstance;
      chart.data?.datasets?.forEach((dataSet, dataSetIndex) => {
         const meta = chart.getDatasetMeta(dataSetIndex);
         const targetData = meta.data[index];
         if (targetData) {
            meta.data[index].hidden = !targetData.hidden;
            const newLegendLabels = [...legendLabels];
            newLegendLabels[index].hidden = meta.data[index].hidden;
            setLegendLabels(newLegendLabels);
         }
      });
      chart.update();
   };

   return (
      <List className={classes.list} dense>
         <TransitionGroup>
            {options.length > 0 && (
               <Slide>
                  <TransitionGroup>
                     {legendLabels.map((option) => (
                        <Collapse key={`${option.name}-${option.index}`}>
                           <ListItem
                              dense
                              onClick={(e) =>
                                 handleClickLegend(e, option.index)
                              }
                              button
                           >
                              <ListItemIcon style={{ minWidth: 0 }}>
                                 <Checkbox
                                    edge="start"
                                    style={{ color: colors[option.index] }}
                                    checked={
                                       !legendLabels?.[option.index]?.hidden
                                    }
                                 />
                              </ListItemIcon>
                              <ListItemText>
                                 {option[optionLabelProp]}
                                 <br />
                                 <strong>
                                    [{option[optionValueProp]} {optionDataType}
                                    {option[optionValueProp] !== 1 && "s"}]
                                 </strong>
                              </ListItemText>
                           </ListItem>
                        </Collapse>
                     ))}
                  </TransitionGroup>
               </Slide>
            )}
         </TransitionGroup>
      </List>
   );
};

CustomLegend.propTypes = {
   chartData: PropTypes.object,
   chartRef: PropTypes.object,
   colors: PropTypes.array,
   fullWidth: PropTypes.bool,
   hideEmpty: PropTypes.bool,
   optionDataType: PropTypes.string,
   optionLabelProp: PropTypes.string,
   optionValueProp: PropTypes.string,
   options: PropTypes.array,
};

CustomLegend.defaultProps = {
   chartData: {},
   chartRef: {},
   colors: colorsArray,
   fullWidth: false,
   hideEmpty: false,
   optionDataType: "Vote",
   optionLabelProp: "name",
   optionValueProp: "votes",
   options: [],
};

export default CustomLegend;
