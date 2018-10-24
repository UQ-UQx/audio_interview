import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import MUIButton from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

import TypedQuestion from '../components/TypedQuestion';
import CountdownDisplay from '../components/CountdownDisplay';

const styles = {
    root: {
        flexGrow: 1,
    },
    button: {
        margin: 10,
        outline: 'none',
    },
};

// &&{} ensures that all styles defined here are !important
const Play = styled(MUIButton)`
    && {
        margin: 10px;
        :focus {
            outline: none;
        }
    }
`;

const Stop = styled(MUIButton)`
    && {
        margin: 10px;
        :focus {
            outline: none;
        }
    }
`;

const StyledStepButton = styled(StepButton)`
    && {
        outline: none;
    }
`;

const Video = styled.video`
    width: 0;
    height: 0;
`;

const ButtonsContainer = styled.div`
    width: 100%;
    text-align: center;
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
            currentImageKey: 0,
            currentQuestion: props.questions[0],
            currentQuestionKey: 0,
            countdown: props.questions[0].settings.time,
        };

        getDuration(props.audioURL, duration => {
            this.setState({ audioDuration: duration });
        });

        this.seekTo = this.seekTo.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.stop = this.stop.bind(this);
    }

    componentWillUnmount() {
        if (this.time) this.timer = null;
    }

    play() {
        console.log('Play Clicked');
        this.audioplayer.play();
        this.setState({ playing: true, paused: false });
        console.log('TIIIIIMMMERR', this.timer);
        this.timer = setInterval(() => {
            const { played, audioDuration, countdown } = this.state;
            const { images, questions } = this.props;

            let countdownRemaining = countdown;
            const roundedPlayed = parseFloat(played.toFixed());

            if (played === audioDuration) {
                clearInterval(this.timer);
                if (this.time) this.timer = null;

                this.setState({
                    playing: false,
                    paused: false,
                    currentImage: images[0],
                    currentQuestion: questions[0],
                    currentImageKey: 0,
                    currentQuestionKey: 0,
                });
                this.audioplayer.pause();
                this.audioplayer.currentTime = 0;
            } else {
                this.setState({
                    ...(images[roundedPlayed]
                        ? {
                              currentImage: [images[roundedPlayed]],
                              currentImageKey: roundedPlayed,
                          }
                        : {}),
                    ...(questions[roundedPlayed]
                        ? {
                              currentQuestion: questions[roundedPlayed],
                              currentQuestionKey: roundedPlayed,
                              countdown: questions[roundedPlayed].settings.time,
                          }
                        : {
                              countdown: (countdownRemaining -= 1),
                          }),
                    played: this.audioplayer.currentTime,
                });
            }
        }, 1000);
    }

    pause() {
        const { played } = this.state;
        console.log('pause Clicked');
        this.audioplayer.pause();
        clearInterval(this.timer);
        if (this.time) this.timer = null;

        let paused = true;
        if (played === 0) {
            paused = false;
        }
        this.setState({ playing: false, paused });
    }

    stop() {
        const { images, questions } = this.props;
        console.log('Stop Clicked');
        this.audioplayer.pause();
        this.audioplayer.currentTime = 0;

        clearInterval(this.timer);
        if (this.time) this.timer = null;

        this.setState({
            playing: false,
            paused: false,
            played: 0,
            currentImage: images[0],
            currentQuestion: questions[0],
            currentImageKey: 0,
            currentQuestionKey: 0,
            countdown: questions[0].settings.time,
        });
    }

    seekTo(time) {
        console.log(time); // 134

        const { playing, audioDuration } = this.state;
        const { images, questions } = this.props;

        const questionsTimes = Object.keys(questions);
        const imagesTimes = Object.keys(images);

        let timeToSeek = time;
        if (time === audioDuration) timeToSeek = parseFloat(time.toFixed());

        let currentQuestionKey = questions[0];
        const askedQuestions = questionsTimes.filter(
            qtime => qtime < timeToSeek
        );
        switch (timeToSeek) {
            case 0:
                currentQuestionKey = 0;
                break;
            case audioDuration:
                currentQuestionKey = questionsTimes.pop();
                break;
            default:
                currentQuestionKey = askedQuestions.pop();
                break;
        }

        let currentImageKey = images[0];
        const shownImages = imagesTimes.filter(itime => itime < timeToSeek);
        switch (timeToSeek) {
            case 0:
                currentImageKey = 0;
                break;
            case audioDuration:
                currentImageKey = imagesTimes.pop();
                break;
            default:
                currentImageKey = shownImages.pop();
                break;
        }

        const currentQuestion = questions[currentQuestionKey];
        const nextQuestionKey = (
            parseInt(currentQuestionKey, 10) +
            parseInt(currentQuestion.settings.time, 10)
        ).toString();

        // the key variables are just start times of the question/image

        console.log(
            'current question: ',
            currentQuestionKey,
            currentImageKey,
            nextQuestionKey,
            currentQuestion
        );

        this.audioplayer.pause();
        clearInterval(this.timer);
        if (this.timer) this.timer = null;
        this.audioplayer.currentTime = timeToSeek;
        this.setState({
            playing: false,
            paused: true,
            played: timeToSeek,
            currentImage: images[currentImageKey],
            currentQuestion: questions[currentQuestionKey],
            currentQuestionKey,
            countdown: nextQuestionKey - timeToSeek,
        });
        if (playing) this.play();
        console.log(this.timer);
    }

    render() {
        const {
            audioDuration,
            playing,
            paused,
            played,
            currentImage,
            currentQuestion,
            countdown,
            currentQuestionKey,
            currentImageKey,
        } = this.state;
        const { audioURL, questions, student, classes } = this.props;

        console.log(currentImageKey);
        const roundedPlayed = parseFloat(played.toFixed());

        // console.log(
        //     playing,
        //     paused,
        //     played,
        //     roundedPlayed,
        //     currentQuestion,
        //     countdown,
        //     currentImageKey
        // );

        const startTime = currentQuestion.settings.time;

        const fullQuestions = Object.keys(questions).filter(
            time => questions[time].question !== ''
        );

        // console.log(fullQuestions, currentQuestionKey);

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
                    <TypedQuestion question={currentQuestion.question} />
                </div>
                <CountdownDisplay
                    time={countdown}
                    startTime={startTime}
                    changeHue={currentQuestion.question !== ''}
                    display={countdown.toString()}
                />
                <div className={classes.root}>
                    <br />
                    <LinearProgress
                        variant="determinate"
                        value={(played / audioDuration) * 100}
                    />
                    <Stepper
                        alternativeLabel
                        nonLinear
                        activeStep={fullQuestions.indexOf(
                            currentQuestionKey.toString()
                        )}
                    >
                        {fullQuestions.map((time, index) => (
                            <Step key={questions[time].id}>
                                <StyledStepButton
                                    focusRipple
                                    onClick={() => {
                                        this.seekTo(parseInt(time, 10));
                                    }}
                                >
                                    Question {index + 1}
                                </StyledStepButton>
                            </Step>
                        ))}
                    </Stepper>
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
                <ButtonsContainer>
                    <Play
                        variant="extendedFab"
                        color={playing ? 'primary' : 'default'}
                        aria-label={
                            playing ? 'Pause Interview' : 'Play Interview'
                        }
                        // className={classes.button}
                        onClick={() => {
                            if (playing) {
                                this.pause();
                            } else {
                                this.play();
                            }
                        }}
                    >
                        <Icon>{playing ? 'pause' : 'play_arrow'}</Icon>
                        {playing ? 'pause interview' : 'play interview'}
                    </Play>

                    {playing || paused ? (
                        <Stop
                            variant="extendedFab"
                            color="secondary"
                            aria-label="Stop Interview"
                            onClick={this.stop}
                        >
                            <Icon>replay</Icon>
                            Reset
                        </Stop>
                    ) : (
                        ''
                    )}

                    {/* <Button
                        onClick={() => {
                            console.log(audioDuration);
                            this.seekTo(246);
                        }}
                    >
                        Seek
                    </Button> */}
                </ButtonsContainer>
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
