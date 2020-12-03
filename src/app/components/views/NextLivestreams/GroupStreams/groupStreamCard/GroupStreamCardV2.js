import React, {Fragment, useState} from 'react';
import {withFirebase} from "context/firebase";
import {makeStyles} from "@material-ui/core/styles";
import {speakerPlaceholder} from "../../../../util/constants";
import {Avatar, Card, CardMedia} from "@material-ui/core";
import {AvatarGroup} from "@material-ui/lab";
import Streamers from "./Streamers";

const useStyles = makeStyles((theme) => {
    const transition = `transform ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`
    return ({
        game: {
            display: "flex",
            justifyContent: "center",
            border: "1px solid red",
            "& img": {
                maxWidth: "100%"
            },
            position: "relative",
            width: "100%",
            cursor: "pointer",
            "&:hover": {
                "& .back": {
                    "& .streamers": {
                        width: "100%",
                        justifyContent: "space-between",
                    },
                    "& .streamer": {
                        fontSize: "0.9rem",
                    },
                    "& .name": {
                        fontWeight: "bold",
                    },
                },

                "& .background": {
                    transition: "transform 200ms cubic-bezier(0.21, 1, 0.81, 1), opacity 100ms linear",
                    opacity: 1,
                    transform: "scale(1.35, 1.3) translateY(5%)",
                },
            },
        },
        rank: {
            position: 'absolute',
            top: '0',
            right: '1em',
            zIndex: '999',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            background: 'rgba(0, 0, 0, 0.65)',
            padding: '0.5em 0.5em 0.75em',
            WebkitClipPath: 'polygon(100% 0%, 100% 100%, 50% 85%, 0 100%, 0 0)',
            clipPath: 'polygon(100% 0%, 100% 100%, 50% 85%, 0 100%, 0 0)',
            WebkitTransition: transition,
            transition: transition,
            transform: ({cardHovered}) => cardHovered && "translate(150%, -61%)"
        },
        companyLogo: {
            borderRadius: theme.spacing(1)
        },
        logoWrapper: {
            height: 230,
            width: 180,
            display: "flex",
            alignItems: "center",
            padding: theme.spacing(1)
        },
        front: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: ({cardHovered}) => cardHovered && "translateY(-30%) scale(0.8)",
            transition: '250ms',
            '& .thumbnail': {
                borderRadius: 'var(--br)'
            },
            '& .name': {
                margin: '0.75em 0',
                textAlign: 'center',
                animation: ({cardHovered}) => cardHovered && "$gameName 250ms forwards",

            },
            '& .stats': {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: ({cardHovered}) => cardHovered && 0,
            },
            '& .viewers': {
                display: 'flex',
                alignItems: 'center'
            },
            '& .viewers::before': {
                content: '\'\\f007\'',
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: '0.75em',
                marginRight: '0.5em'
            },
            '& .streamers img': {
                border: '2px solid rgb(13, 17, 19)',
                '&:nth-of-type(1)': {
                    transform: 'translateX(50%)',
                    zIndex: '1'
                },
                '&:nth-of-type(2)': {
                    transform: 'translateX(25%)'
                }
            }
        },
        back: {
            transition: ({cardHovered}) => cardHovered && "transform 250ms ease, opacity 150ms linear",
            opacity: ({cardHovered}) => cardHovered ? 1 : 0,
            transform: ({cardHovered}) => cardHovered ? "translateY(0)" : 'translateY(35%)',
            position: 'absolute',
            top: '55%',
            left: '0',
            right: '0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5em',
            '& .streaming-info': {
                columns: '2',
                columnRule: '1px solid rgba(255, 255, 255, 0.25)'
            },
            '& .game-stat': {
                fontSize: '1.125rem',
                textAlign: 'center',
                "& span": {
                    fontSize: '0.85rem',
                    display: 'block'
                }
            }
        },
        background: {
            transition:({cardHovered}) => cardHovered && `${transition}, opacity 100ms linear`,
            transform:({cardHovered}) => cardHovered? 'scale(1.35, 1.3) translateY(5%)': 'scale(0.2, 0.9)',
            opacity:({cardHovered}) => cardHovered? 1: 0,
            background: 'rgb(40, 46, 54)',
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
            zIndex: '-1',
            borderRadius: '0.5em',
            overflow: 'hidden',
            "& img": {
                opacity: '.3',
                clipPath: 'url(#wave)',
                height: '30%',
                width: '100%',
                objectFit: 'cover'
            }
        },
        '@keyframes pulse': {
            '0%': {
                transform: 'scale(0.95)',
                opacity: '0.9'
            },
            '100%': {
                transform: 'scale(1.4)',
                opacity: '0'
            }
        },
        '@keyframes gameName': {
            '0%': {
                textAlign: 'left',
                opacity: '1'
            },
            '20%': {
                textAlign: 'left',
                opacity: '0'
            },
            '50%': {
                textAlign: 'center',
                opacity: '0',
                transform: 'scale(1.2)'
            },
            '100%': {
                textAlign: 'center',
                opacity: '1',
                transform: 'scale(1.2)'
            }
        }
    })
})


const GroupStreamCardV2 = ({
                               livestream,
                               user,
                               fields,
                               userData,
                               firebase,
                               livestreamId,
                               id,
                               careerCenterId,
                               groupData,
                               listenToUpcoming
                           }) => {

    const [cardHovered, setCardHovered] = useState(false)
    console.log("cardHovered", cardHovered);
    const classes = useStyles({cardHovered})
    const handleHovered = () => {
        setCardHovered(true)
    }

    const handleMouseLeft = () => {
        setCardHovered(false)
    }
    console.log("livestream", livestream);

    return (
        <Fragment>
            <div onMouseLeave={handleMouseLeft} onMouseEnter={handleHovered} className={classes.game}>
                <div className={classes.rank}>3</div>
                <div className={classes.front}>
                    <Card className={classes.logoWrapper}>
                        <img className={classes.companyLogo} src={livestream.companyLogoUrl} alt=""/>
                    </Card>
                    <h3 className="name icon">{livestream.company}</h3>
                    <div className="stats">
                        <p className="viewers icon">539.9k</p>
                        <div className={classes.streamers}>
                            <AvatarGroup max={3}>
                                {livestream.speakers?.map(speaker => {
                                    return (<Avatar
                                        key={speaker.id}
                                        src={speaker.avatar || speakerPlaceholder}
                                        alt={speaker.firstName}/>)
                                })}
                            </AvatarGroup>
                        </div>
                    </div>
                </div>
                <div className={classes.back}>
                    <div className="streaming-info">
                        <p className="game-stat">559k<span>Watching</span></p>
                        <p className="game-stat">25.8k<span>Streams</span></p>
                    </div>
                    <button className="btn">See more streams</button>
                    <Streamers speakers={livestream.speakers} cardHovered={cardHovered}/>
                </div>

                <div className={classes.background}>
                    <img src={livestream.backgroundImageUrl} alt=""/>
                </div>
            </div>
            <svg width="0" height="0" x="0px" y="0px">
                <defs>
                    <clipPath id="wave" clipPathUnits="objectBoundingBox">
                        <path
                            d="M1.5,0H1H0.5H0v0.8C0.3,0.8,0.3,1,0.5,1c0,0,0,0,0,0C0.8,1,0.8,0.8,1,0.8c0,0,0,0,0,0C1.3,0.8,1.3,1,1.5,1
	C1.8,1,1.8,0.8,2,0.8V0H1.5z"
                        />
                        <animateTransform
                            attributeType="XML"
                            attributeName="transform"
                            type="translate"
                            from="0 0"
                            to="-200 0"
                            begin="0s"
                            dur="10s"
                            repeatCount="indefinite"
                        />
                    </clipPath>
                </defs>
            </svg>
            <style jsx>{`
              *,
              *::before,
              *::after {
                box-sizing: border-box;
              }

              :root {
                --clr-dark: rgb(13, 17, 19);
                --clr-light: #fff;
                --clr-accent: rgb(222, 52, 0);
                --clr-accent-dark: rgb(163, 38, 0);
                --clr-secondary: rgb(0, 76, 199);

                --br: 0.5em;

                --transition: transform 200ms cubic-bezier(0.21, 1, 0.81, 1);
              }


              h1,
              h2,
              h3,
              p {
                margin: 0;
              }

              .btn {
                cursor: pointer;
                border: 0;
                background: rgb(0, 76, 199);
                border-radius: 100vw;
                color: #fff;
                font-weight: bold;
                padding: 0.5em 1.5em;
              }

              .icon::before {
                display: inline-block;
                font-family: "Font Awesome 5 Free";
                font-weight: 900;
                font-style: normal;
                font-variant: normal;
                text-rendering: auto;
                -webkit-font-smoothing: antialiased;
              }

              .game {
                position: relative;
                width: 12.5em;
                cursor: pointer;
              }

              .streamers {
                display: flex;
                text-align: center;

                &:nth-of-type(1) {
                  transform: translateX(50%);
                  z-index: 1;
                }

                &:nth-of-type(2) {
                  transform: translateX(25%);
                }

                img {
                  width: 2em;
                  height: 2em;
                  border-radius: 50%;
                  border: 2px solid rgb(13, 17, 19);
                }
              }

              .rank {
                position: absolute;
                top: 0;
                right: 1em;
                z-index: 1000;
                font-weight: bold;
                font-size: 1.125rem;
                background: rgba(0, 0, 0, 0.65);
                padding: 0.5em 0.5em 0.75em;
                clip-path: polygon(100% 0%, 100% 100%, 50% 85%, 0 100%, 0 0);
                transition: var(--transition);
              }


              .back {
                opacity: 0;
                position: absolute;
                top: 55%;
                left: 0;
                right: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1.5em;
                transform: translateY(35%);

                .streaming-info {
                  columns: 2;
                  column-rule: 1px solid rgba(255, 255, 255, 0.25);
                }

                .game-stat {
                  font-size: 1.125rem;
                  text-align: center;

                  span {
                    font-size: 0.85rem;
                    display: block;
                  }
                }
              }

              .background {
                background: rgb(40, 46, 54);
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: -1;
                transform: scale(0.2, 0.9);
                opacity: 0;
                border-radius: 0.5em;
                overflow: hidden;

                img {
                  opacity: .3;
                  clip-path: url(#wave);
                  height: 30%;
                  width: 100%;
                  object-fit: cover;
                }
              }

              .game:hover {
                .rank {
                  transform: translate(150%, -61%);
                }

                .front {
                  transform: translateY(-30%) scale(0.8);

                  .name {
                    animation: gameName 250ms forwards;
                  }

                  .stats {
                    opacity: 0;
                  }
                }

                .back {
                  opacity: 1;
                  transition: transform 250ms ease, opacity 150ms linear;

                  transform: translateY(0);

                  .streamers {
                    width: 100%;
                    justify-content: space-between;
                  }

                  .streamer {
                    font-size: 0.9rem;
                  }

                  .name {
                    font-weight: bold;
                  }
                }

                .background {
                  transition: var(--transition), opacity 100ms linear;
                  opacity: 1;
                  transform: scale(1.35, 1.3) translateY(5%);
                }
              }

              @keyframes gameName {
                0% {
                  text-align: left;
                  opacity: 1;
                }

                20% {
                  text-align: left;
                  opacity: 0;
                }

                50% {
                  text-align: center;
                  opacity: 0;
                  transform: scale(1.2);
                }

                100% {
                  text-align: center;
                  opacity: 1;
                  transform: scale(1.2);
                }
              }

              @keyframes pulse {
                0% {
                  transform: scale(0.95);
                  opacity: 0.9;
                }

                100% {
                  transform: scale(1.4);
                  opacity: 0;
                }
              }
            `}</style>
        </Fragment>
    )

}


export default withFirebase(GroupStreamCardV2);
