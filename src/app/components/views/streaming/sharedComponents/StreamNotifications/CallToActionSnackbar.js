import React, { useState, forwardRef, useCallback } from 'react';
import clsx from 'clsx';
import { alpha, makeStyles } from "@material-ui/core/styles";
import { useSnackbar, SnackbarContent } from 'notistack';
import Collapse from '@material-ui/core/Collapse';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { CircularProgress } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    [theme.breakpoints.up('sm')]: {
      minWidth: '344px !important',
    },

  },
  glass: {
    backgroundColor: alpha(theme.palette.common.black, 0.4),
    backdropFilter: "blur(5px)",
    color: theme.palette.common.white
  },
  mainButton:{
    color: "inherit"
  },
  card: {
    // backgroundColor: '#fddc6c',
    width: '100%',
    borderLeft: `4mm ridge ${alpha(theme.palette.primary.main, 0.6)}`
  },
  typography: {
    fontWeight: 'bold',
  },
  actionRoot: {
    padding: '8px 8px 8px 16px',
    justifyContent: 'space-between',
  },
  mainIconWrapper:{
    "& svg":{
      fontSize: 50
    }
  },
  icons: {
    marginLeft: 'auto',
    display: "flex"
  },
  close:{
    color: "inherit"
  },
  expand: {
    padding: '8px 8px',
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  collapse: {
    padding: 16,
  },
  checkIcon: {
    fontSize: 20,
    color: '#b3b3b3',
    paddingRight: 4,
  },
  button: {
    padding: 0,
    textTransform: 'none',
  },
}));

const CallToActionSnackbar = forwardRef(({ message, id, onClick, onDismiss, icon, loading, buttonText }, ref) => {
   const classes = useStyles();
   const [expanded, setExpanded] = useState(false);
   const handleExpandClick = useCallback(() => {
      setExpanded((oldExpanded) => !oldExpanded);
   }, []);


   return (
      <SnackbarContent ref={ref} className={classes.root}>
         <Card className={clsx(classes.card, classes.glass)}>
            <CardActions classes={{ root: classes.actionRoot }}>
              <span className={classes.mainIconWrapper}>
              {icon && icon}
              </span>
               <Typography variant="subtitle2" className={classes.typography}>
                  {message}
               </Typography>
               <div className={classes.icons}>
                   <Button
                     className={classes.mainButton}
                     onClick={onClick}
                     // startIcon={
                     //   loading ? (
                     //     <CircularProgress size={20} color="inherit" />
                     //   ): icon
                     // }
                     disabled={loading}
                     size="small"
                     // color="primary"
                   >
                     {loading ? "" : buttonText}
                   </Button>
                  <IconButton
                     className={classes.close}
                     disabled={loading}
                     onClick={onDismiss}
                  >
                     <CloseIcon />
                  </IconButton>
               </div>
            </CardActions>
            {/*<Collapse in={expanded} timeout="auto" unmountOnExit>*/}
            {/*   <Paper className={classes.collapse}>*/}
            {/*      <Typography gutterBottom>PDF ready</Typography>*/}
            {/*      <Button size="small" className={classes.button}>*/}
            {/*         <CheckCircleIcon className={classes.checkIcon} />*/}
            {/*         Download now*/}
            {/*      </Button>*/}
            {/*   </Paper>*/}
            {/*</Collapse>*/}
         </Card>
      </SnackbarContent>
   );
});

export default CallToActionSnackbar;