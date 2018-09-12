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
} from '../actions';

import InterviewCam from './InterviewCam';
import TypedQuestion from './TypedQuestion';
import CountdownDisplay from './CountdownDisplay';
import Preview from './Preview';
import SubmissionStatus from './SubmissionStatus';

import { convertGroupsToQuestionsList } from '../helpers';

const mediaContainerHeight = 200;

const AppContainer = styled.div`
    ${props =>
        props.hide &&
        css`
            display: none;
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

const Mask = styled.div`
    ${props =>
        props.hide &&
        css`
            background-color: rgba(0, 0, 0, 0.5);
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 10;
            ${'' /* display: block !important; */};
        `};
    text-align: center;
`;

const MaskContent = styled.div`
    margin: auto;
    width: 50%;
    ${props =>
        props.hide &&
        css`
            display: none;
        `};
`;

const gapTimeDefault = 5000;
const screenshotInterval = 1000;
let prevLoaded = 0;

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            stage: 'start',
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
        };

        this.stopInterview = this.stopInterview.bind(this);
        this.startInterview = this.startInterview.bind(this);
        this.changeQuestion = this.changeQuestion.bind(this);
        this.startMediaRecording = this.startMediaRecording.bind(this);
        this.stopMediaRecording = this.stopMediaRecording.bind(this);
        this.updateTimer = this.updateTimer.bind(this);

        this.onData = this.onData.bind(this);
        this.onStop = this.onStop.bind(this);
    }

    componentDidMount() {
        if (this.timeout) window.clearTimeout(this.timeout);
        if (this.gapTimeout) window.clearTimeout(this.gapTimeout);
        if (this.timerInterval) window.clearInterval(this.timerInterval);
    }

    componentWillUnmount() {
        if (this.timeout) window.clearTimeout(this.timeout);
        if (this.gapTimeout) window.clearTimeout(this.gapTimeout);
        if (this.timerInterval) window.clearInterval(this.timerInterval);
        const { stopRecording } = this.props;
        stopRecording();
    }

    onData(recordedBlob) {
        console.log(
            'chunk of real-time data is: ',
            this.state,
            this.props,
            recordedBlob
        );
    }

    onStop(recordedBlob) {
        console.log('recordedBlob is: ', recordedBlob);

        const { uploadStartMoment } = this.state;

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
            .then(
                audioBase64 =>
                    new Promise(resolve => {
                        const output = this.whammyEncoder.compile();

                        console.log(output);

                        const reader = new FileReader();
                        reader.readAsDataURL(output);
                        reader.onloadend = () => {
                            const videoBase64 = reader.result;

                            console.log('WOOAH', videoBase64);

                            resolve({ audioBase64, videoBase64 });
                        };
                    })
            )
            .then(({ audioBase64, videoBase64 }) => {
                const currentMoment = moment();

                const fd = new FormData();
                const filename = encodeURIComponent(
                    `audio_recording_${new Date().getTime()}.webm`
                );
                console.log(`mp3name = ${filename}`);
                fd.append('fname', filename);
                fd.append('action', 'uploadFile');
                fd.append('audio', audioBase64);
                fd.append('video', videoBase64);
                fd.append('userID', $LTI.userID);

                fd.append('jwt_token', $JWT_TOKEN);

                const config = {
                    onUploadProgress: progressEvent => {
                        const uploadStartMomentCal =
                            uploadStartMoment || currentMoment;
                        // console.log(progressEvent)
                        // var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
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

                        const chunk = progressEvent.loaded - prevLoaded;

                        // console.log("CONVERSION ",progressEvent.loaded, progressEvent.loaded/128 )

                        let speed =
                            progressEvent.loaded / 1000 / secondsElapsed;

                        const uploadTimeRemaining =
                            (progressEvent.total - progressEvent.loaded) /
                            1000 /
                            speed;

                        speed = parseInt(speed.toFixed(2), 10);

                        // console.log(
                        //     'difference: ',
                        //     uploadStartMomentCal,
                        //     percentCompleted,
                        //     secondsElapsed,
                        //     progressEvent.loaded - prevLoaded,
                        //     progressEvent,
                        //     speed,
                        //     uploadTimeRemaining
                        // );

                        prevLoaded = progressEvent.loaded;

                        this.setState({
                            progress: percentCompleted,
                            speed,
                            uploadTimeRemaining,
                            uploadStartMoment: currentMoment,
                        });
                    },
                };

                return axios({
                    method: 'post',
                    url: '../public/api/api.php',
                    data: fd,
                    contentType: false,
                    processData: false,
                    ...config,
                });
            })
            .then(filenames => {
                console.log('red', filenames);

                const { audioFilename, videoFilename } = filenames.data;
                this.setState({
                    audioFilename,
                    videoFilename,
                });
            })
            .catch(error => {
                console.log(error);
            });
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

            // console.log(list);

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

    render() {
        const {
            screenshots,
            question,
            // askQuestion,
            // clearQuestion,
            record,
        } = this.props;

        const {
            timeRemaining,
            currentQuestion,
            gapTime,
            gapTimeRemaining,
            stage,
            // record,
            audioFilename,
            videoFilename,
            progress,
            speed,
            uploadTimeRemaining,
        } = this.state;

        // console.log(record, this.state.record);

        let startTime = currentQuestion ? currentQuestion.settings.time : 1;
        let time = timeRemaining;
        let inGap = false;

        if (!currentQuestion) {
            startTime = gapTime / 1000;
            time = gapTimeRemaining;
            inGap = true;
        }

        console
            .log
            // screenshots,
            // timeRemaining / startTime,
            // timeRemaining,
            // startTime,
            // audioFilename,
            // videoFilename,
            // record,
            // stage
            ();

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

        return (
            <Fragment>
                <MaskContent hide={stage !== 'end'}>
                    <SubmissionStatus
                        percentCompleted={progress}
                        timeRemaining={uploadTimeRemaining}
                        speed={speed}
                    />
                </MaskContent>
                <AppContainer hide={stage === 'end'}>
                    <Fragment>
                        <MediaVisualsContainer Height={mediaContainerHeight}>
                            <WebcamContainer>
                                <InterviewCam
                                    height={mediaContainerHeight}
                                    onScreenshot={data => {
                                        // console.log();
                                        this.whammyEncoder.add(data);
                                    }}
                                    screenshotStreamInterval={
                                        screenshotInterval
                                    }
                                />
                            </WebcamContainer>
                            <AudioVisualContainer>
                                <ReactMic
                                    record={
                                        stage === 'during' || stage === 'last'
                                    }
                                    // className="sound-wave"
                                    visualSetting="frequencyBars"
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
                        <ButtonsContainer>
                            <Button
                                color="primary"
                                onClick={this.startInterview}
                            >
                                Start Interview
                            </Button>
                            <Button
                                color="warning"
                                onClick={this.stopInterview}
                            >
                                Stop Interview
                            </Button>
                        </ButtonsContainer>
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
                                <Button
                                    color="warning"
                                    onClick={this.stopInterview}
                                >
                                    Stop Interview
                                </Button>
                            </ButtonsContainer>
                        )}
                    </Fragment>

                    {/* <hr />
                        <br />
                        {[...screenshots].reverse().map((screenshot, index) => (
                            <img
                                key={screenshot}
                                width="100px"
                                src={screenshot}
                                alt={`user face screenshot ${index}`}
                            />
                        ))}

                        {audioFilename && videoFilename ? (
                            <Preview
                                audioFilename={audioFilename}
                                videoFilename={videoFilename}
                            />
                        ) : (
                            ''
                        )} */}
                </AppContainer>
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
    screenshots: PropTypes.arrayOf(PropTypes.string),
    questionsList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    groups: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    updateQuestions: PropTypes.func.isRequired,
    saveQuestionsList: PropTypes.func.isRequired,
    // record: PropTypes.bool.isRequired,
};

App.defaultProps = {
    screenshots: [],
    question: '',
};

export default withRouter(
    connect(
        state => ({
            record: state.record,
            question: state.question,
            screenshots: state.screenshots,
            questionsList: state.questionsList,
            groups: state.groups,
        }),
        {
            startRecording,
            stopRecording,
            askQuestion,
            clearQuestion,
            updateQuestions,
            saveQuestionsList,
        }
    )(App)
);
