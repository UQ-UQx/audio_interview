import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import axios from 'axios';
import { ReactMic } from 'react-mic';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import moment from 'moment';
import whammy from '../../public/lib/js/whammy';
import {
    startRecording,
    stopRecording,
    askQuestion,
    clearQuestion,
    updateQuestions,
    saveQuestionsList,
    setCompletedTrue,
} from '../actions';

import InterviewCam from './InterviewCam';
import TypedQuestion from './TypedQuestion';
import CountdownDisplay from './CountdownDisplay';
import SubmissionStatus from './SubmissionStatus';

import { convertGroupsToQuestionsList } from '../helpers';

const mediaContainerHeight = 200;

const AppContainer = styled.div`
    ${props =>
        props.hide &&
        css`
            ${'' /* display: none; */};
        `};

    ${props =>
        props.blur &&
        css`
            position: relative;
            -webkit-filter: blur(10px);
            -moz-filter: blur(10px);
            -o-filter: blur(10px);
            -ms-filter: blur(10px);
            filter: blur(10px);
        `};
`;

const MediaVisualsContainer = styled.div`
    height: ${props => (props.Height ? props.Height : mediaContainerHeight)}px;

    ${'' /* flex-wrap: wrap; */};
`;

const WebcamContainer = styled.div`
    float: left;
    width: 20%;
`;
const AudioVisualContainer = styled.div`
    float: left;
    width: 80%;
`;

const QuestionContainer = styled.div`
    flex-flow: column;
`;

const CountdownContainer = styled.div`
    text-align: center;
    width: 100%;
`;

const ButtonsContainer = styled.div`
    margin-top: 20px;
    width: 100%;
    text-align: center;
    button {
        margin: 10px;
    }
`;

const CoundownTitle = styled.div`
    font-size: 25px;
    font-weight: bold;
    margin: 10px;
`;

const MaskContent = styled.div`
    margin: auto;

    ${props =>
        props.hide &&
        css`
            ${'' /* display: none; */};
        `};
`;

const gapTimeDefault = 10000;
const screenshotInterval = 5000;

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            stage: props.completed ? 'end' : 'start',
            questions: [],
            currentQuestion: null,
            gapTime: gapTimeDefault,
            gapTimeRemaining: gapTimeDefault / 1000,
            timeRemaining: 0,
            record: false,
            audioFilename: null,
            videoFilename: null,
            progress: 0,
            uploadStartMoment: null,
            currentLoaded: 0,
            speed: 0,
            uploadTimeRemaining: 0,
            mediaAvailable: false,
            mediaDenied: false,
        };

        this.stopInterview = this.stopInterview.bind(this);
        this.startInterview = this.startInterview.bind(this);
        this.changeQuestion = this.changeQuestion.bind(this);
        this.startMediaRecording = this.startMediaRecording.bind(this);
        this.stopMediaRecording = this.stopMediaRecording.bind(this);
        this.updateTimer = this.updateTimer.bind(this);
        this.saveInterview = this.saveInterview.bind(this);
        this.checkIfMediaIsAvailable = this.checkIfMediaIsAvailable.bind(this);

        // this.onData = this.onData.bind(this);
        this.onStop = this.onStop.bind(this);
    }

    componentDidMount() {
        if (this.timeout) window.clearTimeout(this.timeout);
        if (this.gapTimeout) window.clearTimeout(this.gapTimeout);
        if (this.timerInterval) window.clearInterval(this.timerInterval);
        this.checkIfMediaIsAvailable();
    }

    componentWillUnmount() {
        if (this.timeout) window.clearTimeout(this.timeout);
        if (this.gapTimeout) window.clearTimeout(this.gapTimeout);
        if (this.timerInterval) window.clearInterval(this.timerInterval);
        const { stopRecording } = this.props;
        stopRecording();
    }

    // onData(recordedBlob) {
    //     // console.log(
    //     //     'chunk of real-time data is: ',
    //     //     this.state,
    //     //     this.props,
    //     //     recordedBlob
    //     // );
    // }

    onStop(recordedBlob) {
        console.log('recordedBlob is: ', recordedBlob);

        axios({
            method: 'get',
            url: recordedBlob.blobURL, // blob url eg. blob:http://127.0.0.1:8000/e89c5d87-a634-4540-974c-30dc476825cc
            responseType: 'blob',
        })
            .then(
                response =>
                    new Promise(resolve => {
                        const reader = new FileReader();
                        reader.readAsDataURL(response.data);
                        reader.onloadend = () => {
                            const base64data = reader.result;
                            resolve(base64data);
                        };
                    })
            )
            .then(audioBase64 => {
                this.saveInterview({ audioBase64 });

                // const output = this.whammyEncoder.compile();

                // console.log(output);

                // const reader = new FileReader();
                // reader.readAsDataURL(output);
                // reader.onloadend = () => {
                //     const videoBase64 = reader.result;

                //     console.log('WOOAH', videoBase64);

                // };
            })

            .catch(error => {
                console.log(error);
            });
    }

    saveInterview({ audioBase64 }) {
        const { uploadStartMoment } = this.state;
        const { setCompletedTrue, screenshots } = this.props;
        const currentMoment = moment();

        const fd = new FormData();
        const filename = encodeURIComponent(
            `audio_recording_${new Date().getTime()}.webm`
        );
        console.log(`mp3name = ${filename}`);
        fd.append('fname', filename);
        fd.append('action', 'uploadFile');
        fd.append('audio', audioBase64);
        fd.append(
            'images',
            JSON.stringify(
                screenshots.map(screenshot => ({
                    filename: '_screenshot_image_',
                    data: screenshot.data,
                    timestamp: screenshot.timestamp,
                }))
            )
        );
        // fd.append('video', videoBase64);
        fd.append('userID', $LTI.userID);
        fd.append('ltiID', $LTI.id);

        fd.append('jwt_token', $JWT_TOKEN);

        const config = {
            onUploadProgress: progressEvent => {
                const uploadStartMomentCal = uploadStartMoment || currentMoment;
                const percentCompleted = parseInt(
                    (
                        (progressEvent.loaded / progressEvent.total) *
                        100
                    ).toFixed(2),
                    10
                );
                const secondsElapsed = moment().diff(
                    uploadStartMomentCal,
                    'seconds',
                    true
                );

                let speed = progressEvent.loaded / 1000 / secondsElapsed;

                const uploadTimeRemaining =
                    (progressEvent.total - progressEvent.loaded) / 1000 / speed;

                speed = parseInt(speed.toFixed(2), 10);

                console.log(
                    percentCompleted,
                    speed,
                    uploadTimeRemaining,
                    currentMoment
                );

                this.setState({
                    progress: percentCompleted,
                    speed,
                    uploadTimeRemaining,
                    uploadStartMoment: currentMoment,
                });
            },
        };

        // axios({
        //     method: 'post',
        //     url: '../public/api/api.php',
        //     data: fd,
        //     contentType: false,
        //     processData: false,
        //     ...config,
        // }).then(() => {
        //     console.log('CALLING');
        //     setCompletedTrue();
        // });

        axios
            .post('../public/api/api.php', fd, config)
            .then(response => {
                setCompletedTrue();
                console.log(response);
            })
            .catch(error => {
                console.log(error);
            });

        // .then(response => {
        //     console.log(this.props, response);
        //     // const responseData = response[0];
        //     // const { audioFilename, filenames } = responseData.data;
        //     // console.log(audioFilename, filenames);
        //     // this.setState({
        //     //     audioFilename,
        //     //     videoFilename,
        //     // });
        // });
    }

    startMediaRecording() {
        this.setState({
            record: true,
        });
        const { startRecording } = this.props;

        startRecording();
        this.startInterview();
    }

    stopMediaRecording() {
        this.setState({
            record: false,
        });
        const { stopRecording } = this.props;

        stopRecording();
        this.stopInterview();
    }

    changeQuestion(question) {
        const { askQuestion, clearQuestion } = this.props;
        const { questions, gapTime } = this.state;

        const list = [...questions];
        clearQuestion();
        this.setState({
            currentQuestion: null,
        });

        this.gapTimeout = setTimeout(() => {
            askQuestion(question.question);

            const nextQuestion = list.shift();

            this.setState({
                ...(list.length === 0 ? { stage: 'last' } : {}),
                questions: list,
                currentQuestion: question,
                timeRemaining: question.settings.time,
                gapTimeRemaining: gapTime / 1000,
            });

            this.timeout = setTimeout(() => {
                if (nextQuestion) {
                    this.changeQuestion(nextQuestion);
                } else {
                    this.stopInterview();
                }
            }, question.settings.time * 1000);
        }, gapTime);
    }

    stopInterview() {
        const { stopRecording } = this.props;

        if (this.timeout) window.clearTimeout(this.timeout);
        if (this.gapTimeout) window.clearTimeout(this.gapTimeout);
        if (this.timerInterval) window.clearInterval(this.timerInterval);

        clearQuestion();
        stopRecording();

        this.setState({
            stage: 'end',
            questions: [],
            currentQuestion: null,
            timeRemaining: 0,
            gapTimeRemaining: 0,
            record: false,
        });
    }

    startInterview() {
        const {
            startRecording,
            // stopRecording,
            // screenshots,
            // question,
            askQuestion,
            // clearQuestion,
            groups,
            questionsList,
            updateQuestions,
            saveQuestionsList,
        } = this.props;

        const { gapTime } = this.state;

        let list = questionsList;
        let SaveList = Promise.resolve();
        if (questionsList.length === 0) {
            list = convertGroupsToQuestionsList(groups);

            SaveList = Promise.all([
                updateQuestions(list),
                saveQuestionsList(list),
            ]);
        }

        SaveList.then(() => {
            startRecording();

            this.whammyEncoder = new whammy.Video(
                1 / (screenshotInterval / 1000)
            );

            this.setState({
                record: true,
                stage: 'during',
            });

            const question = list.shift();

            clearQuestion();

            this.timerInterval = setInterval(() => {
                this.updateTimer();
            }, 1000);

            this.gapTimeout = setTimeout(() => {
                this.setState({
                    questions: list,
                    currentQuestion: question,
                    timeRemaining: question.settings.time,
                    gapTimeRemaining: gapTime / 1000,
                });
                askQuestion(question.question);

                const nextQuestion = list.shift();

                this.timeout = setTimeout(
                    () => this.changeQuestion(nextQuestion),
                    question.settings.time * 1000
                );
            }, gapTime);
        }).catch(error => {
            console.error(error);
        });
    }

    updateTimer() {
        const { timeRemaining, gapTimeRemaining } = this.state;

        if (timeRemaining > 0)
            this.setState({
                timeRemaining: timeRemaining - 1,
            });

        if (gapTimeRemaining > 0 && timeRemaining < 1)
            this.setState({
                gapTimeRemaining: gapTimeRemaining - 1,
            });
    }

    checkIfMediaIsAvailable() {
        console.log(this.state);

        const { completed } = this.props;

        console.log('completed', completed);
        if (!completed) {
            navigator.mediaDevices
                .getUserMedia({ audio: true, video: true })
                .then(stream =>
                    /* use the stream */
                    {
                        console.log(stream);
                        // stream.stop();
                        this.setState({
                            mediaAvailable: true,
                            mediaDenied: false,
                        });
                    }
                )
                .catch(err =>
                    /* handle the error */
                    {
                        console.log(err);
                        this.setState({
                            mediaAvailable: false,
                            mediaDenied: true,
                        });
                    }
                );
        }
    }

    render() {
        const { question, completed } = this.props;

        const {
            timeRemaining,
            currentQuestion,
            gapTime,
            gapTimeRemaining,
            stage,
            audioFilename,
            videoFilename,
            progress,
            speed,
            uploadTimeRemaining,
            record,
            mediaAvailable,
        } = this.state;

        let startTime = currentQuestion ? currentQuestion.settings.time : 1;
        let time = timeRemaining;
        let inGap = false;

        if (!currentQuestion) {
            startTime = gapTime / 1000;
            time = gapTimeRemaining;
            inGap = true;
        }

        let stageReference = '';

        switch (stage) {
            case 'start':
                stageReference = 'first';
                break;
            case 'during':
                stageReference = 'next';
                break;
            case 'last':
                stageReference = 'last';
                break;
            default:
                break;
        }

        console.log(
            'wait a minute',
            stage,
            record,
            completed,
            !completed && progress === 0 && mediaAvailable
        );
        return (
            <Fragment>
                {/* <MaskContent hide={stage !== 'end'}> */}

                <MaskContent>
                    <SubmissionStatus
                        percentCompleted={progress}
                        timeRemaining={uploadTimeRemaining}
                        speed={speed}
                        completed={completed}
                        audioFilename={audioFilename}
                        videoFilename={videoFilename}
                    />
                </MaskContent>

                {!completed && progress === 0 && mediaAvailable ? ( // if interview is not complete or upload has not started
                    <AppContainer hide={stage === 'end' || completed}>
                        <Fragment>
                            <MediaVisualsContainer
                                Height={mediaContainerHeight}
                            >
                                <WebcamContainer>
                                    <InterviewCam
                                        height={mediaContainerHeight}
                                        onScreenshot={data => {
                                            console.log(data);
                                            // this.whammyEncoder.add(data);
                                        }}
                                        screenshotStreamInterval={
                                            screenshotInterval
                                        }
                                    />
                                </WebcamContainer>
                                <AudioVisualContainer>
                                    <ReactMic
                                        record={
                                            stage === 'during' ||
                                            stage === 'last'
                                        }
                                        // visualSetting="frequencyBars"
                                        height={200}
                                        width={window.screen.width}
                                        onStop={this.onStop}
                                        onData={this.onData}
                                        strokeColor="black"
                                        backgroundColor="lightgrey"
                                    />
                                </AudioVisualContainer>
                            </MediaVisualsContainer>

                            <QuestionContainer>
                                <TypedQuestion
                                    Height={mediaContainerHeight}
                                    question={question}
                                />
                            </QuestionContainer>

                            {stage === 'during' || stage === 'last' ? (
                                <CountdownContainer>
                                    <CoundownTitle>
                                        {inGap
                                            ? `Your ${stageReference} question will be shown in ...`
                                            : ''}
                                    </CoundownTitle>
                                    <CountdownDisplay
                                        changeHue={!inGap}
                                        startTime={startTime}
                                        time={time}
                                        display={`${time}`}
                                    />
                                </CountdownContainer>
                            ) : (
                                <ButtonsContainer>
                                    <Button
                                        color="primary"
                                        onClick={this.startInterview}
                                    >
                                        Start Interview
                                    </Button>
                                </ButtonsContainer>
                            )}
                        </Fragment>
                    </AppContainer>
                ) : (
                    ''
                )}

                {!completed && !mediaAvailable
                    ? 'Please grant permissions'
                    : ''}
            </Fragment>
        );
    }
}

App.propTypes = {
    startRecording: PropTypes.func.isRequired,
    stopRecording: PropTypes.func.isRequired,
    question: PropTypes.string,
    askQuestion: PropTypes.func.isRequired,
    clearQuestion: PropTypes.func.isRequired,
    questionsList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    groups: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    updateQuestions: PropTypes.func.isRequired,
    saveQuestionsList: PropTypes.func.isRequired,
    completed: PropTypes.bool.isRequired,
    setCompletedTrue: PropTypes.func.isRequired,
    screenshots: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

App.defaultProps = {
    question: '',
};

export default withRouter(
    connect(
        state => ({
            record: state.record,
            question: state.question,
            questionsList: state.questionsList,
            groups: state.groups,
            completed: state.completed,
            screenshots: state.screenshots,
        }),
        {
            startRecording,
            stopRecording,
            askQuestion,
            clearQuestion,
            updateQuestions,
            saveQuestionsList,
            setCompletedTrue,
        }
    )(App)
);
