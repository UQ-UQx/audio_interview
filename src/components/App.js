import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import axios from 'axios';
import { ReactMic } from 'react-mic';
import { adjustHue } from 'polished';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import {
    startRecording,
    stopRecording,
    askQuestion,
    clearQuestion,
    updateQuestions,
    saveQuestionsList,
} from '../actions';
// import { Row, Col } from 'reactstrap';
// import ApiTestButtons from './ApiTestButtons';
import InterviewCam from './InterviewCam';
import TypedQuestion from './TypedQuestion';
import CountdownDisplay from './CountdownDisplay';
import { convertGroupsToQuestionsList } from '../helpers';

const mediaContainerHeight = 400;

const AppContainer = styled.div``;

const MediaVisualsContainer = styled.div`
    height: ${props => (props.Height ? props.Height : mediaContainerHeight)}px;
    margin-bottom: 10px;
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
const gapTimeDefault = 10000;

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            questions: [],
            currentQuestion: null,
            gapTime: gapTimeDefault,
            gapTimeRemaining: gapTimeDefault / 1000,
            timeRemaining: 0,
            record: false,
            filename: null,
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
            .then(base64 => {
                console.log(base64);

                const fd = new FormData();
                const filename = encodeURIComponent(
                    `audio_recording_${new Date().getTime()}.webm`
                );
                console.log(`mp3name = ${filename}`);
                fd.append('fname', filename);
                fd.append('action', 'uploadFile');
                fd.append('data', base64);
                fd.append('jwt_token', $JWT_TOKEN);

                return axios({
                    method: 'post',
                    url: '../public/api/api.php',
                    data: fd,
                    contentType: false,
                    processData: false,
                });
            })
            .then(filename => {
                console.log(filename);
                this.setState({ filename: filename.data });
            })
            .catch(error => {
                console.error(error);
            });

        // axios({
        //     method: 'post',
        //     url: '../public/api/api.php',
        //     data: fd,
        //     contentType: false,
        //     processData: false,
        // })
        //     .then(response => {
        //         console.log(response);
        //     })
        //     .catch(err => {
        //         console.error(err);
        //     });
    }

    startMediaRecording() {
        const { startRecording } = this.props;
        this.setState({
            record: true,
        });
        startRecording();
        this.startInterview();
    }

    stopMediaRecording() {
        const { stopRecording } = this.props;
        this.setState({
            record: false,
        });

        stopRecording();
        this.stopInterview();
    }

    changeQuestion(question) {
        const { askQuestion, clearQuestion } = this.props;
        const { questions, gapTime } = this.state;

        const list = [...questions];
        clearQuestion();

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
        if (this.timeout) clearTimeout(this.timeout);
        if (this.gapTimeout) clearTimeout(this.gapTimeout);
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.setState({
            questions: [],
            currentQuestion: null,
            timeRemaining: 0,
            gapTimeRemaining: 0,
        });
        clearQuestion();
    }

    startInterview() {
        const {
            // startRecording,
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
        } = this.props;

        const {
            timeRemaining,
            currentQuestion,
            gapTime,
            gapTimeRemaining,
            questions,
            record,
            filename,
        } = this.state;

        const startTime = currentQuestion ? currentQuestion.settings.time : 1;
        console.log(record);

        return (
            <AppContainer>
                <MediaVisualsContainer Height={mediaContainerHeight}>
                    <WebcamContainer>
                        <InterviewCam
                            height={mediaContainerHeight}
                            screenshotStreamInterval={5000}
                        />
                    </WebcamContainer>
                    <ReactMic
                        record={record}
                        className="sound-wave"
                        onStop={this.onStop}
                        onData={this.onData}
                        strokeColor="#000000"
                        backgroundColor={adjustHue(
                            90 * (timeRemaining / startTime),
                            '#FF530D'
                        )}
                    />
                </MediaVisualsContainer>

                {[...screenshots].reverse().map((screenshot, index) => (
                    <img
                        key={screenshot}
                        width="100px"
                        src={screenshot}
                        alt={`user face screenshot ${index}`}
                    />
                ))}

                <QuestionContainer>
                    <TypedQuestion
                        Height={mediaContainerHeight}
                        question={question}
                    />
                </QuestionContainer>

                <CountdownContainer>
                    <CountdownDisplay
                        changeHue
                        startTime={startTime}
                        time={timeRemaining}
                    />
                </CountdownContainer>
                <CountdownContainer>
                    {questions.length > 0 ||
                    this.gapTimeout ||
                    gapTimeRemaining > 0 ? (
                        <Fragment>
                            Next Question In:
                            <CountdownDisplay
                                startTime={gapTime / 1000}
                                time={gapTimeRemaining}
                            />
                        </Fragment>
                    ) : (
                        ''
                    )}
                </CountdownContainer>
                <ButtonsContainer>
                    <Button color="primary" onClick={this.startMediaRecording}>
                        Start Interview
                    </Button>
                    <Button color="warning" onClick={this.stopMediaRecording}>
                        Stop Interview
                    </Button>
                </ButtonsContainer>

                {filename ? (
                    <audio controls src={`./media/recordings/${filename}`}>
                        <track kind="captions" src="" />
                    </audio>
                ) : (
                    'none'
                )}
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
