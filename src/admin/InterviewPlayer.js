import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from 'reactstrap';

import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import TypedQuestion from '../components/TypedQuestion';

const styles = {
    root: {
        flexGrow: 1,
    },
};

const Play = styled(Button)``;
const Pause = styled(Button)``;
const Stop = styled(Button)``;

const Video = styled.video`
    width: 0;
    height: 0;
`;

const getDuration = (url, next) => {
    const player = new Audio(url);
    player.addEventListener(
        'durationchange',
        e => {
            if (e.path[0].duration !== Infinity) {
                const { duration } = e.path[0];
                player.remove();
                next(duration);
            }
        },
        false
    );
    player.load();
    player.currentTime = 24 * 60 * 60; // fake big time
    player.volume = 0;
    const nopromise = {
        catch: () => {},
    };
    (player.play() || nopromise).catch(() => {});
    // waiting...
};

class InterviewPlayer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            playing: false,
            paused: false,
            played: 0,
            audioDuration: 0,
            currentImage: props.images[0],
            currentQuestion: props.questions[0],
        };

        getDuration(props.audioURL, duration => {
            this.setState({ audioDuration: duration });
        });
    }

    componentWillUnmount() {
        if (this.time) this.timer = null;
    }

    render() {
        const {
            audioDuration,
            playing,
            paused,
            played,
            currentImage,
            currentQuestion,
        } = this.state;
        const { audioURL, images, questions, student, classes } = this.props;
        console.log(played, audioDuration, playing, paused, questions);

        const roundedPlayed = parseFloat(played.toFixed());

        console.log(played, roundedPlayed, currentQuestion);

        return (
            <div>
                <p>
                    webcam capture of {student.name} at {roundedPlayed} seconds
                </p>
                <div>
                    <img
                        src={`./media/recordings/${$LTI.courseID}/${$LTI.id}/${
                            student.id
                        }/${currentImage}`}
                        alt={`webcam capture of ${
                            student.name
                        } at ${roundedPlayed} seconds`}
                    />
                    <TypedQuestion question={currentQuestion} />
                </div>
                <div className={classes.root}>
                    <br />
                    <LinearProgress
                        variant="determinate"
                        value={(played / audioDuration) * 100}
                    />
                </div>
                <Video
                    preload="all"
                    innerRef={el => {
                        if (el) this.audioplayer = el;
                    }}
                >
                    <source src={audioURL} type="audio/webm" />
                    <track kind="captions" />
                </Video>
                <div>
                    <Play
                        color="primary"
                        onClick={() => {
                            console.log('Play Clicked');
                            this.audioplayer.play();
                            this.setState({ playing: true, paused: false });
                            this.timer = setInterval(() => {
                                const { played, audioDuration } = this.state;
                                const { images, questions } = this.props;

                                const roundedPlayed = parseFloat(
                                    played.toFixed()
                                );

                                if (played === audioDuration) {
                                    clearInterval(this.timer);

                                    this.setState({
                                        playing: false,
                                        paused: false,
                                        currentImage: images[0],
                                        currentQuestion: questions[0],
                                    });
                                    this.audioplayer.pause();
                                    this.audioplayer.currentTime = 0;
                                } else {
                                    this.setState({
                                        ...(images[roundedPlayed]
                                            ? {
                                                  currentImage: [
                                                      images[roundedPlayed],
                                                  ],
                                              }
                                            : {}),
                                        ...(questions[roundedPlayed] ||
                                        questions[roundedPlayed] === ''
                                            ? {
                                                  currentQuestion:
                                                      questions[roundedPlayed],
                                              }
                                            : {}),
                                        played: this.audioplayer.currentTime,
                                    });
                                }
                            }, 1000);
                        }}
                    >
                        Play
                    </Play>
                    <Pause
                        color="info"
                        onClick={() => {
                            console.log('pause Clicked');
                            this.audioplayer.pause();
                            clearInterval(this.timer);
                            let paused = true;
                            if (played === 0) {
                                paused = false;
                            }
                            this.setState({ playing: false, paused });
                        }}
                    >
                        Pause
                    </Pause>
                    <Stop
                        color="danger"
                        onClick={() => {
                            console.log('Stop Clicked');
                            this.audioplayer.pause();
                            this.audioplayer.currentTime = 0;

                            clearInterval(this.timer);
                            this.setState({
                                playing: false,
                                paused: false,
                                played: 0,
                                currentImage: images[0],
                                currentQuestion: questions[0],
                            });
                        }}
                    >
                        Stop
                    </Stop>
                </div>
            </div>
        );
    }
}

InterviewPlayer.propTypes = {
    audioURL: PropTypes.string.isRequired,
    images: PropTypes.shape({}).isRequired,
    questions: PropTypes.shape({}).isRequired,
    student: PropTypes.shape({}).isRequired,
    classes: PropTypes.shape({}).isRequired,
};

export default withStyles(styles)(InterviewPlayer);
