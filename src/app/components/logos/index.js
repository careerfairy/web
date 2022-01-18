import React from 'react'
import Link from "next/link";
import makeStyles from '@mui/styles/makeStyles';
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
    mainLogo: {
        cursor: 'pointer',
        width: '150px',
        display: 'inline-block',
        // marginTop: '10px',
        // marginLeft: '10px'
    },
    logoLink:{
        display: "flex"
    }
}))
export const MainLogo = ({white, className}) => {
    const classes = useStyles()
    return (
        <Link href='/'>
            <a className={classes.logoLink}>
                <img alt="CareerFairy Logo"
                     src={white ? '/logo_white.svg' : '/logo_teal.svg'}
                     className={clsx(classes.mainLogo, className)}/>
            </a>
        </Link>
    )
}
export const MiniLogo = ({size = 30}) => {
    return (
        <Link href='/'>
            <a>
                <img alt="CareerFairy Logo"
                     width={size}
                     height={size}
                     src={"/apple-touch-icon-57x57.png"}/>
            </a>
        </Link>
    )
}