import basicLayoutStyles from "./basicLayoutStyles";

const nextLivestreamsLayoutStyles = (theme) => ({
    ...basicLayoutStyles(theme),
    wrapper: {
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
        paddingTop: 64,
        paddingLeft: props => props.drawerClosedWidth,
        [theme.breakpoints.down('xs')]: {
            paddingTop: 48
        },
    },
    root: {
        backgroundColor: theme.palette.background.dark,
        display: 'flex',
        overflow: 'hidden',
        width: '100%'
    },
    content: {
        ...basicLayoutStyles(theme).content,
        overflowX: 'hidden',
    }
})

export default nextLivestreamsLayoutStyles