import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
   heartPng,
   laughingPng,
   thumbsUpPng,
   wowPng,
} from "../EmotesModal/utils";
import { Paper, Typography, Zoom } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
   emotesPreviewPaperWrapper: {
      zIndex: 1,
      cursor: "pointer",
      bottom: "-10px !important",
      display: "flex",
      boxShadow: theme.shadows[3],
      alignItems: "center",
      zChatEntryContainer: 1,
      padding: theme.spacing(0.1),
      position: "absolute",
      right: 0,
      overflow: "hidden",
      borderRadius: theme.spacing(2),
      "&  > *": {
         margin: theme.spacing(0, 0.3),
      },
   },
   previewImg: {
      width: theme.spacing(1.5),
      height: theme.spacing(1.5),
   },
   totalText: {
      fontSize: theme.spacing(1.3),
   },
}));
const EmotesPreview = ({
   chatEntry: { wow, heart, thumbsUp, laughing },
   onClick,
}) => {
   const classes = useStyles();
   const [emotes, setEmotes] = useState([]);
   const [total, setTotal] = useState(0);
   useEffect(() => {
      const newEmotes = [
         {
            src: laughingPng.src,
            alt: laughingPng.alt,
            prop: "laughing",
            data: laughing,
         },
         {
            src: wowPng.src,
            alt: wowPng.alt,
            prop: "wow",
            data: wow,
         },
         {
            src: heartPng.src,
            alt: heartPng.alt,
            prop: "heart",
            data: heart,
         },
         {
            src: thumbsUpPng.src,
            alt: thumbsUpPng.alt,
            prop: "thumbsUp",
            data: thumbsUp,
         },
      ].filter((emote) => emote.data?.length);
      const newTotal = newEmotes.reduce(
         (acc, curr) => acc + (curr.data.length || 0),
         0
      );
      setEmotes(newEmotes);
      setTotal(newTotal);
   }, [wow, heart, thumbsUp, laughing]);

   return (
      <Zoom unmountOnExit mountOnEnter in={Boolean(emotes.length)}>
         <Paper onClick={onClick} className={classes.emotesPreviewPaperWrapper}>
            {emotes.map(({ alt, src, prop }) => (
               <img
                  key={prop}
                  className={classes.previewImg}
                  alt={alt}
                  src={src}
               />
            ))}
            <Typography className={classes.totalText}>{total || 0}</Typography>
         </Paper>
      </Zoom>
   );
};

EmotesPreview.propTypes = {
   chatEntry: PropTypes.object.isRequired,
   onClick: PropTypes.func.isRequired,
};
export default EmotesPreview;
