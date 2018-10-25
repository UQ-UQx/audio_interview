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

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import Typography from '@material-ui/core/Typography';

import moment from 'moment';

import CountdownDisplay from '../components/CountdownDisplay';
import TypedQuestion from '../components/TypedQuestion';

const styles = {
    root: {
        flexGrow: 1,
    },
    button: {
        margin: 10,
        outline: 'none',
    },
    card: {
        display: 'flex',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
    },
    content: {
        flex: '1 0 auto',
    },
    cover: {
        width: 255,
        height: 191,
    },
};

const StyledMUIButton = styled(MUIButton)`
    && {
        margin: 10px;
    }
`;

// &&{} ensures that all styles defined here are !important
const Play = styled(StyledMUIButton)`
    && {
        :focus {
            outline: none;
        }
    }
`;

const Stop = styled(StyledMUIButton)`
    && {
        :focus {
            outline: none;
        }
    }
`;

const SeekToButton = styled(StyledMUIButton)`
    && {
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

const AudioPlayer = styled.audio`
    width: 0;
    height: 0;
`;

const ButtonsContainer = styled.div`
    width: 100%;
    text-align: center;
`;

const StyledCardMedia = styled.img`
    && {
        width: 280px;
        height: 211px;
    }
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
        clearInterval(this.timer);
        if (this.timer) this.timer = null;
    }

    play() {
        console.log('Play Clicked');
        this.audioplayer.play();
        this.setState({ playing: true, paused: false });
        this.timer = setInterval(() => {
            const { played, audioDuration, countdown } = this.state;
            const { images, questions } = this.props;

            let countdownRemaining = countdown;
            const roundedPlayed = parseFloat(played.toFixed());

            if (played === audioDuration) {
                clearInterval(this.timer);
                if (this.timer) this.timer = null;

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
        if (this.timer) this.timer = null;

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
        if (this.timer) this.timer = null;

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
        const { playing, audioDuration } = this.state;
        const { images, questions } = this.props;

        const questionsTimes = Object.keys(questions);
        const imagesTimes = Object.keys(images);

        let timeToSeek = parseFloat(time.toFixed());

        if (time === audioDuration) timeToSeek = parseFloat(time.toFixed());
        console.log('TIIIIIIIIIMMEE', time, timeToSeek); // 134

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
        const { audioURL, questions, student, classes, submitted } = this.props;

        console.log(currentImageKey, moment(submitted).format('LLLL'));
        const roundedPlayed = parseFloat(played.toFixed());

        console.log(
            playing,
            paused,
            played,
            roundedPlayed,
            currentQuestion,
            countdown,
            currentImageKey
        );

        const startTime = currentQuestion.settings.time;

        const fullQuestions = Object.keys(questions).filter(
            time => questions[time].question !== ''
        );

        // console.log(moment(submitted));

        // console.log(
        //     moment()
        //         .utc()
        //         .format('YYYY-MM-DD HH:mm:ss'),
        //     moment().format('YYYY-MM-DD HH:mm:ss')
        // );

        return (
            <div>
                <Card className={classes.card}>
                    <div>
                        <StyledCardMedia
                            className={classes.cover}
                            src={`./media/recordings/${$LTI.courseID}/${
                                $LTI.id
                            }/${student.id}/${currentImage}`}
                            alt={`webcam capture of ${
                                student.name
                            } at ${roundedPlayed} seconds`}
                        />
                    </div>
                    <div className={classes.details}>
                        <CardContent className={classes.content}>
                            <Typography
                                gutterBottom
                                variant="h5"
                                component="h5"
                            >
                                {student.name}
                            </Typography>
                            <div>
                                <Typography variant="body2" component="p">
                                    username:
                                    <Typography
                                        variant="body1"
                                        component="span"
                                    >
                                        {student.username}
                                    </Typography>
                                </Typography>

                                <Typography variant="body2" component="p">
                                    Interview Submitted
                                </Typography>
                                <Typography variant="body1">
                                    {student.email}
                                </Typography>

                                <Typography variant="body2" component="p">
                                    Interview Submitted
                                </Typography>
                                <Typography variant="body1">
                                    {moment(submitted).format('LLLL')} UTC
                                </Typography>
                            </div>{' '}
                        </CardContent>
                    </div>
                </Card>
                <div>
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
                <AudioPlayer
                    preload="all"
                    innerRef={el => {
                        if (el) this.audioplayer = el;
                    }}
                >
                    <source src={audioURL} type="audio/webm" />
                    <track kind="captions" />
                </AudioPlayer>
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
                        <React.Fragment>
                            <Stop
                                variant="extendedFab"
                                color="secondary"
                                aria-label="Stop Interview"
                                onClick={this.stop}
                            >
                                <Icon>replay</Icon>
                                Reset
                            </Stop>

                            <SeekToButton
                                variant="extendedFab"
                                color="default"
                                aria-label="Stop Interview"
                                onClick={() => {
                                    this.seekTo(
                                        played - 30 < 0 ? 0 : played - 30
                                    );
                                }}
                            >
                                <Icon fontSize="large">replay_30</Icon>
                                30
                            </SeekToButton>
                            <SeekToButton
                                variant="extendedFab"
                                color="default"
                                aria-label="Stop Interview"
                                onClick={() => {
                                    this.seekTo(
                                        played - 5 < 0 ? 0 : played - 5
                                    );
                                }}
                            >
                                <Icon fontSize="large">replay_5</Icon>5
                            </SeekToButton>
                            <SeekToButton
                                variant="extendedFab"
                                color="default"
                                aria-label="Stop Interview"
                                onClick={() => {
                                    this.seekTo(
                                        played + 5 > audioDuration
                                            ? audioDuration
                                            : played + 5
                                    );
                                }}
                            >
                                <Icon fontSize="large">forward_5</Icon>5
                            </SeekToButton>
                            <SeekToButton
                                variant="extendedFab"
                                color="default"
                                aria-label="Stop Interview"
                                onClick={() => {
                                    this.seekTo(
                                        played + 30 > audioDuration
                                            ? audioDuration
                                            : played + 30
                                    );
                                }}
                            >
                                <Icon fontSize="large">forward_30</Icon>
                                30
                            </SeekToButton>
                        </React.Fragment>
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
    submitted: PropTypes.string.isRequired,
};

export default withStyles(styles)(InterviewPlayer);
