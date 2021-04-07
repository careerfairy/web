import basicLayoutStyles from "./basicLayoutStyles";

const nextLivestreamsLayoutStyles = (theme) => ({
  ...basicLayoutStyles(theme),
  wrapper: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
    paddingTop: 64,
    [theme.breakpoints.up('lg')]: {
      paddingLeft: props => props.drawerClosedWidth
    },
    [theme.breakpoints.down('xs')]: {
      paddingTop: 56
    },
  },
})

export default nextLivestreamsLayoutStyles