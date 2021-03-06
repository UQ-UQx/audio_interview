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

import Tooltip from '@material-ui/core/Tooltip';

import CircularProgress from '@material-ui/core/CircularProgress';
// import Popper from '@material-ui/core/Popper';
// import Fade from '@material-ui/core/Fade';
// import Paper from '@material-ui/core/Paper';
import CountdownDisplay from '../components/CountdownDisplay';
import TypedQuestion from '../components/TypedQuestion';

// #region styles

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
    toolTip: {
        fontSize: 20,
    },
};

const Loading = styled(CircularProgress)`
    && {
        margin: 60px;
    }
`;

const StyledMUIButton = styled(MUIButton)`
    && {
        margin: 2px;
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

const PlaybackSettingButton = styled(StyledMUIButton)`
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

const QuestionToolTip = styled(Tooltip)`
    && {
        /* width: 50px; */
        font-size: 20px !important;
    }
`;

// #endregion styles

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
            loading: true,
            //            playbackSettingOpen: false,
            playbackSpeed: 1,
        };

        getDuration(props.audioURL, duration => {
            this.setState({ audioDuration: duration, loading: false });
        });

        this.seekTo = this.seekTo.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.stop = this.stop.bind(this);
        //        this.togglePlaybackSetting = this.togglePlaybackSetting.bind(this);
        this.playbackSpeed = this.playbackSpeed.bind(this);
    }

    componentWillUnmount() {
        if (this.timer) clearInterval(this.timer);
    }

    play(speed = 1) {
        if (this.audioplayer.currentTime === 0) {
            this.audioplayer.currentTime = 1;
            this.audioplayer.currentTime = 0;
        }
        console.log('Play Clicked');
        this.audioplayer.play();
        this.setState({ playing: true, paused: false });
        /*        
        const { playbackSpeed } = this.state;
        let interval = 1000;
        switch (playbackSpeed) {
            case 1.5:
                interval = 3000;
                break;
            case 2:
                interval = 2000;
                break;
            default:
                interval = 1000;
        }
        console.log('interval', playbackSpeed, interval);
        */
        let interval = 1000;
        //        let remove = 1;
        switch (speed) {
            case 1.5:
                interval = 667;
                //                remove = 3;
                break;
            case 2:
                interval = 500;
                //                remove = 2;
                break;
            default:
                interval = 1000;
            //                remove = 1;
        }
        console.log('interval', speed, interval);

        this.timer = setInterval(() => {
            const { audioDuration, countdown } = this.state;
            const { images, questions } = this.props;

            const roundedPlayed = parseInt(
                this.audioplayer.currentTime.toFixed(),
                10
            ); // Math.floor(this.audioplayer.currentTime);

            let countdownRemaining = countdown;

            console.log(
                this.audioplayer.currentTime,
                roundedPlayed,
                audioDuration,
                countdown
            );

            if (this.audioplayer.currentTime === audioDuration) {
                this.stop();
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
                    played: roundedPlayed,
                });
            }
        }, interval);
    }

    pause() {
        console.log('pause Clicked');
        if (this.timer) clearInterval(this.timer);
        this.audioplayer.pause();

        this.setState({ playing: false, paused: true });
    }

    stop() {
        const { images, questions } = this.props;
        console.log('Stop Clicked');
        this.audioplayer.pause();
        this.audioplayer.currentTime = 0;

        if (this.timer) clearInterval(this.timer);

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

    /*    
    togglePlaybackSetting() {
        console.log('togglePlaybackSetting', this.state);
        this.setState(state => ({
            playbackSettingOpen: !state.playbackSettingOpen,
        }));
    }
*/

    seekTo(time) {
        // 0 x x.xxx
        console.log(time);

        const { playing, audioDuration } = this.state;
        const { images, questions } = this.props;
        const questionsTimes = Object.keys(questions);
        const imagesTimes = Object.keys(images);

        const askedQuestions = questionsTimes.filter(
            qtime => parseInt(qtime, 10) <= time
        );
        const shownImages = imagesTimes.filter(
            itime => parseInt(itime, 10) <= time
        );

        console.log(askedQuestions, images);

        let currentQuestionKey = 0;
        let currentImageKey = 0;

        switch (time) {
            case 0:
                this.stop();
                return;
            case audioDuration:
                this.stop();
                return;
            default:
                if (askedQuestions.length > 0 && shownImages.length > 0) {
                    console.log('working');
                    currentQuestionKey = askedQuestions.pop();
                    currentImageKey = shownImages.pop();
                }
                console.log('nope');

                break;
        }

        const currentQuestion = questions[currentQuestionKey];
        const currentImage = images[currentImageKey];

        const nextQuestionKey = parseInt(
            questionsTimes[
                questionsTimes.indexOf(currentQuestionKey.toString()) + 1
            ],
            10
        );

        console.log(
            questionsTimes,
            questionsTimes.indexOf(currentQuestionKey.toString()),
            currentQuestionKey,
            nextQuestionKey,
            time
        );

        const countdown = nextQuestionKey - time;

        const wasPlaying = playing;

        this.pause();
        if (this.timer) clearInterval(this.timer);
        this.audioplayer.currentTime = time;
        this.setState({
            played: time,
            currentImage,
            currentQuestion,
            currentQuestionKey,
            countdown,
        });
        if (wasPlaying && time > 0) this.play();

        console.log(this.timer);
    }

    playbackSpeed(speed) {
        //
        const { playbackSpeed } = this.state;
        let newSpeed = 1;
        if (playbackSpeed !== speed) {
            newSpeed = speed;
        }
        console.log('playback speed', newSpeed);
        this.audioplayer.playbackRate = newSpeed;
        this.setState({ playbackSpeed: newSpeed });
        //        this.stop();
        this.pause();
        this.play(newSpeed);
        /*
        if (playbackSpeed === speed) {
            this.audioplayer.playbackRate = 1;
            this.setState({ playbackSpeed: 1 });
        } else {
            this.audioplayer.playbackRate = speed;
            this.setState({ playbackSpeed: speed });
        }
*/
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
            currentImageKey, // eslint-disable-line no-unused-vars
            loading,
            playbackSpeed,
        } = this.state;
        const { audioURL, questions, student, classes, submitted } = this.props;

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

        return loading ? (
            <React.Fragment>
                <Loading /> Loading Recorded Interview...
            </React.Fragment>
        ) : (
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
                                    Username:
                                    <Typography
                                        variant="body1"
                                        component="span"
                                    >
                                        {student.username}
                                    </Typography>
                                </Typography>

                                <Typography variant="body2" component="p">
                                    Email:
                                </Typography>
                                <Typography variant="body1">
                                    {student.email}
                                </Typography>

                                <Typography variant="body2" component="p">
                                    Interview submitted
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
                                <QuestionToolTip
                                    placement="top"
                                    title={questions[time].question}
                                    classes={{
                                        ...{ tooltip: '150' },
                                    }}
                                >
                                    <StyledStepButton
                                        focusRipple
                                        onClick={() => {
                                            this.seekTo(parseInt(time, 10));
                                        }}
                                    >
                                        Question {index + 1}
                                    </StyledStepButton>
                                </QuestionToolTip>
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
                                        played - 30 <= 0 ? 0 : played - 30
                                    );
                                }}
                            >
                                <Icon fontSize="large">replay_30</Icon>
                            </SeekToButton>
                            <SeekToButton
                                variant="extendedFab"
                                color="default"
                                aria-label="Stop Interview"
                                onClick={() => {
                                    this.seekTo(
                                        played - 5 <= 0 ? 0 : played - 5
                                    );
                                }}
                            >
                                <Icon fontSize="large">replay_5</Icon>
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
                                <Icon fontSize="large">forward_5</Icon>
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
                            </SeekToButton>
                            <PlaybackSettingButton
                                variant="extendedFab"
                                color={
                                    playbackSpeed === 1.5
                                        ? 'primary'
                                        : 'default'
                                }
                                aria-label="Setting Playback Speed 1.5"
                                onClick={() => {
                                    this.playbackSpeed(1.5);
                                }}
                            >
                                <Icon fontSize="large">speed</Icon>
                                1.5
                            </PlaybackSettingButton>
                            <PlaybackSettingButton
                                variant="extendedFab"
                                color={
                                    playbackSpeed === 2 ? 'primary' : 'default'
                                }
                                aria-label="Setting Playback Speed 2"
                                onClick={() => {
                                    this.playbackSpeed(2);
                                }}
                            >
                                <Icon fontSize="large">speed</Icon>
                                2.0
                            </PlaybackSettingButton>
                            {/*
                            <PlaybackSettingButton
                                variant="extendedFab"
                                color="default"
                                aria-label="Setting Playback Speed"
                                onClick={() => {
                                    this.togglePlaybackSetting();
                                }}
                            >
                                <Icon fontSize="large">
                                    settings_applications
                                </Icon>
                                Playback
                            </PlaybackSettingButton>
                            <Popper open={playbackSettingOpen} transition>
                                <Fade timeout={350}>
                                    <Paper>
                                        <Typography>
                                            The content of the Popper.
                                        </Typography>
                                    </Paper>
                                </Fade>
                            </Popper>
                        */}
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
