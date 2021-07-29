import React from 'react';
import {alpha, makeStyles} from "@material-ui/core/styles";
import {Container, Grid, Typography} from "@material-ui/core";
import Link from "next/link";
import footerLinks from "./footerLinks";
import icons from "./icons";

const useStyles = makeStyles(theme => {
    const greyColor = alpha(theme.palette.text.secondary, 0.5)
    return ({
        root: {
            background: theme.palette.common.white
        },
        footerTitle: {
            marginTop: theme.spacing(2),
            color: "inherit",
        },
        linkWrapper: {
            display: "flex",
            justifyContent: "center",
            padding: theme.spacing(1),
            "& a": {
                color: "inherit",
                borderColor: "inherit",
                borderBottom: "2px solid",
                "&:hover": {
                    color: theme.palette.primary.main
                }
            }
        },
        footerTitleWrapper: {},
        containerRoot: {
            color: greyColor,
            // '& > *:nth-last-child(n+2)': {
            //     marginBottom: theme.spacing(3)
            // },
            '& > *': {
                marginBottom: theme.spacing(3)
            },
        },
        iconsWrapper: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        iconWrapper: {
            padding: theme.spacing(0, 3),
            "& .MuiSvgIcon-root": {
                fontSize: theme.spacing(4),
                color: greyColor,
                "&:hover": {
                    color: theme.palette.primary.main
                }
            }
        }
    });
});

const FooterV2 = ({}) => {

    const classes = useStyles()

    return (
        <div className={classes.root}>
            <Container className={classes.containerRoot}>
                <div className={classes.footerTitleWrapper}>
                    <Typography align="center" className={classes.footerTitle} variant="h6">
                        LIVE STREAMING CAREER INSPIRATION
                    </Typography>
                </div>
                <div>
                    <Grid justifyContent="center" container>
                        {footerLinks.map(({links, category}) =>
                            (<Grid key={category} item xs={12} sm={4} md={3} lg={2}>
                                    {links.map(({label, href}) => (
                                        <div key={href} className={classes.linkWrapper}>
                                            <Link href={href}>
                                                <a>{label}</a>
                                            </Link>
                                        </div>
                                    ))}
                                </Grid>
                            ))}
                    </Grid>
                </div>
                <div className={classes.iconsWrapper}>
                    {icons.map(({icon, href}) => (
                        <a className={classes.iconWrapper}
                           href={href}
                           key={href}
                           target="_blank"
                           rel="noopener
                            noreferrer"
                        >
                            {icon}
                        </a>))}
                </div>
                <div>
                    <Typography align="center">
                        2021 - CareerFairy AG - All Rights Reserved - Made in Zurich, Switzerland
                    </Typography>
                </div>
            </Container>
        </div>
    );
};

export default FooterV2;
