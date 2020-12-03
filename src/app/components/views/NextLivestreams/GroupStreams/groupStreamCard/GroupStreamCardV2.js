import React, {Fragment} from 'react';
import {withFirebase} from "context/firebase";
import {makeStyles} from "@material-ui/core/styles";
import streamer from '../../../../../public/'

const useStyles = makeStyles((theme) => ({}));


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

    console.log("livestream", livestream);

    return (
        <Fragment>
            <div className="game">
                <div className="rank">3</div>

                <div className="front">
                    <img className="thumbnail" src="/game-cover.png" alt=""/>
                    <h3 className="name icon">Game name</h3>
                    <div className="stats">
                        <p className="viewers icon">539.9k</p>
                        <div className="streamers">
                            <img src="" alt=""/>
                            <img src="/streamer-2.png" alt=""/>
                            <img src="/streamer-3.png" alt=""/>
                        </div>
                    </div>
                </div>

                <div className="back">
                    <div className="streaming-info">
                        <p className="game-stat">559k<span>Watching</span></p>
                        <p className="game-stat">25.8k<span>Streams</span></p>
                    </div>
                    <button className="btn">See more streams</button>
                    <div className="streamers">
                        <div className="streamer">
                            <div className="icon"><img src="/streamer-1.png" alt=""/></div>
                            <p className="name">Gamer1</p>
                            <p className="number">36.1k</p>
                        </div>
                        <div className="streamer">
                            <div className="icon"><img src="/streamer-2.png" alt=""/></div>
                            <p className="name">Gamer 2</p>
                            <p className="number">35.1k</p>
                        </div>
                        <div className="streamer">
                            <div className="icon"><img src="/streamer-3.png" alt=""/></div>
                            <p className="name">Gamer 3</p>
                            <p className="number">34.1k</p>
                        </div>
                    </div>
                </div>

                <div className="background">
                    <img src="/game-cover.png" alt=""/>
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

              //body {
              //  font-family: sans-serif;
              //  min-height: 100vh;
              //  display: grid;
              //  place-items: center;
              //  background: var(--clr-dark);
              //  color: var(--clr-light);
              //}

              h1,
              h2,
              h3,
              p {
                margin: 0;
              }

              img {
                max-width: 100%;
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

                img {
                  width: 2em;
                  height: 2em;
                  border-radius: 50%;
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

              .front {
                transition: 250ms;

                .thumbnail {
                  border-radius: var(--br);
                }

                .name {
                  margin: 0.75em 0;
                }

                .stats {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                }

                .viewers {
                  display: flex;
                  align-items: center;
                }

                .viewers::before {
                  content: "\\f007";
                  color: rgba(255, 255, 255, 0.75);
                  font-size: 0.75em;
                  margin-right: 0.5em;
                }

                .streamers img {
                  border: 2px solid rgb(13, 17, 19);

                  &:nth-of-type(1) {
                    transform: translateX(50%);
                    z-index: 1;
                  }

                  &:nth-of-type(2) {
                    transform: translateX(25%);
                  }
                }
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
                border-radius: var(--br);
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

              .streamer {
                .icon {
                  display: inline-block;
                  width: 2em;
                  height: 2em;
                  position: relative;
                  transition: transform ease-in-out 150ms;

                  &::before,
                  &::after {
                    opacity: 0;
                    content: "";
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    right: 0;
                    left: 0;
                    border-radius: 50%;
                  }

                  &::before {
                    content: "\\f04b";
                    font-family: "Font Awesome 5 Free";
                    font-weight: 900;
                    font-size: 0.65em;
                    background: #f00;
                    display: grid;
                    place-items: center;
                    z-index: 10;
                    transition: opacity 75ms linear, background-color 100ms linear;
                  }

                  &:hover {
                    transform: translateY(-15%) scale(1.2);

                    &::before {
                      background: #cc0202;
                    }

                    &::after {
                      background: #f00;
                      z-index: 1;
                      animation: pulse 1250ms infinite;
                    }
                  }
                }

                &:hover {
                  .icon {
                    transform: translateY(-10%);

                    &::before {
                      opacity: 1;
                    }
                  }
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
