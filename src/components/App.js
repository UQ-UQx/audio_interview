import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import axios from 'axios';
import { ReactMic } from 'react-mic';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
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

import { convertGroupsToQuestionsList } from '../helpers';

const mediaContainerHeight = 0;

const AppContainer = styled.div``;

const MediaVisualsContainer = styled.div`
    height: ${props => (props.Height ? props.Height : mediaContainerHeight)}px;
    display: flex;
    flex-wrap: wrap;
`;

const WebcamContainer = styled.div`
    flex: 1;
    text-align: center;
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

const gapTimeDefault = 10000;
const screenshotInterval = 5000;
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

    componentWillUnmount() {
        if (this.timeout) clearTimeout(this.timeout);
        if (this.gapTimeout) clearTimeout(this.gapTimeout);
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    onData(recordedBlob) {
        console.log('chunk of real-time data is: ', this.state, recordedBlob);
    }

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

                return axios({
                    method: 'post',
                    url: '../public/api/api.php',
                    data: fd,
                    contentType: false,
                    processData: false,
                });
            })
            .then(filenames => {
                console.log(filenames);

                const { audioFilename, videoFilename } = filenames.data;
                this.setState({
                    audioFilename,
                    videoFilename,
                });
            })
            .catch(error => {
                console.error(error);
            });
    }

    startMediaRecording() {
        this.setState({
            record: true,
        });
        startRecording();
        this.startInterview();
    }

    stopMediaRecording() {
        this.setState({
            record: false,
        });

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

        if (this.timeout) clearTimeout(this.timeout);
        if (this.gapTimeout) clearTimeout(this.gapTimeout);
        if (this.timerInterval) clearInterval(this.timerInterval);

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
            });

            const question = list.shift();

            clearQuestion();

            this.timerInterval = setInterval(() => {
                this.updateTimer();
            }, 1000);

            this.gapTimeout = setTimeout(() => {
                this.setState({
                    stage: 'during',

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
        } = this.props;

        const {
            timeRemaining,
            currentQuestion,
            gapTime,
            gapTimeRemaining,
            stage,
            record,
            audioFilename,
            videoFilename,
        } = this.state;

        let startTime = currentQuestion ? currentQuestion.settings.time : 1;
        let time = timeRemaining;
        let inGap = false;

        if (!currentQuestion) {
            startTime = gapTime / 1000;
            time = gapTimeRemaining;
            inGap = true;
        }

        console.log(
            screenshots,
            timeRemaining / startTime,
            timeRemaining,
            startTime
        );

        return (
            <AppContainer>
                <MediaVisualsContainer Height={mediaContainerHeight}>
                    <WebcamContainer>
                        <InterviewCam
                            height={mediaContainerHeight}
                            onScreenshot={data => {
                                this.whammyEncoder.add(data);
                            }}
                            screenshotStreamInterval={screenshotInterval}
                        />
                    </WebcamContainer>
                </MediaVisualsContainer>
                <ReactMic
                    record={record}
                    className="sound-wave"
                    // visualSetting="frequencyBars"
                    height={200}
                    width={window.screen.width}
                    onStop={this.onStop}
                    onData={this.onData}
                    strokeColor="white"
                    backgroundColor="black"
                />

                <QuestionContainer>
                    <TypedQuestion
                        Height={mediaContainerHeight}
                        question={question}
                    />
                </QuestionContainer>

                <CountdownContainer>
                    <CoundownTitle>
                        {inGap
                            ? `${
                                  stage === 'start' ? `First` : `Next`
                              } Question In...`
                            : ''}
                    </CoundownTitle>
                    <CountdownDisplay
                        changeHue={!inGap}
                        startTime={startTime}
                        time={time}
                        display={`${time}`}
                    />
                </CountdownContainer>

                <ButtonsContainer>
                    <Button color="primary" onClick={this.startInterview}>
                        Start Interview
                    </Button>
                    <Button color="warning" onClick={this.stopInterview}>
                        Stop Interview
                    </Button>
                </ButtonsContainer>

                <hr />
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
                    <ButtonsContainer>
                        <Button
                            color="primary"
                            onClick={() => {
                                this.audioPlayer.play();
                                this.videoPlayer.play();
                            }}
                        >
                            Start Preview
                        </Button>
                        <Button
                            color="warning"
                            onClick={() => {
                                this.audioPlayer.pause();
                                this.videoPlayer.pause();
                            }}
                        >
                            Stop Preview
                        </Button>
                    </ButtonsContainer>
                ) : (
                    ''
                )}

                <div>
                    {audioFilename ? (
                        <audio
                            ref={ref => {
                                this.audioPlayer = ref;
                            }}
                            src={`./media/recordings/${audioFilename}`}
                        >
                            <track kind="captions" src="" />
                        </audio>
                    ) : (
                        ''
                    )}
                </div>

                <div>
                    {videoFilename ? (
                        <video
                            ref={ref => {
                                this.videoPlayer = ref;
                            }}
                            src={`./media/recordings/${videoFilename}`}
                        >
                            <track kind="captions" src="" />
                        </video>
                    ) : (
                        ''
                    )}
                </div>
            </AppContainer>
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
