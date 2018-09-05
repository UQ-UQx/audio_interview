import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import axios from 'axios';
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
    height: ${props => (props.Height ? props.Height : '400')}px;
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

const gapTimeDefault = 5000;

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            questions: [],
            currentQuestion: null,
            gapTime: gapTimeDefault,
            gapTimeRemaining: gapTimeDefault / 1000,
            timeRemaining: 0,
        };
        this.startInterview = this.startInterview.bind(this);
        this.changeQuestion = this.changeQuestion.bind(this);
        this.updateTimer = this.updateTimer.bind(this);
    }

    componentWillUnmount() {
        if (this.timeout) clearTimeout(this.timeout);
        if (this.gapTimeout) clearTimeout(this.gapTimeout);
        if (this.timerInterval) clearInterval(this.timerInterval);
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
            console.log('LIIIST', [...list]);

            const question = list.shift();

            console.log('LIIIST', [...list]);
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

    changeQuestion(question) {
        const { askQuestion, clearQuestion } = this.props;
        const { questions, gapTime } = this.state;

        console.log('LIIIST', [...questions]);

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
                    if (this.timeout) clearTimeout(this.timeout);
                    if (this.gapTimeout) clearTimeout(this.gapTimeout);
                    if (this.timerInterval) clearInterval(this.timerInterval);

                    this.setState({
                        questions: list,
                        currentQuestion: null,
                        timeRemaining: 0,
                        gapTimeRemaining: 0,
                    });
                    clearQuestion();
                }
            }, question.settings.time * 1000);
        }, gapTime);
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
            // startRecording,
            // stopRecording,
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
        } = this.state;

        console.log(this.state, currentQuestion, gapTime, gapTimeRemaining);
        return (
            <AppContainer>
                <MediaVisualsContainer Height={mediaContainerHeight}>
                    <WebcamContainer>
                        <InterviewCam
                            Height={mediaContainerHeight}
                            screenshotStreamInterval={5000}
                        />
                    </WebcamContainer>
                </MediaVisualsContainer>
                {[...screenshots].reverse().map((screenshot, index) => (
                    <img
                        key={screenshot}
                        width="100px"
                        src={screenshot}
                        alt={`user face screenshot ${index}`}
                    />
                ))}
                {/* <Button
                    onClick={() => {
                        startRecording();
                        askQuestion('This is a new question');
                    }}
                >
                    Start
                </Button>
                <Button
                    onClick={() => {
                        stopRecording();
                        clearQuestion();
                    }}
                >
                    Stop
                </Button> */}

                <QuestionContainer>
                    <TypedQuestion
                        Height={mediaContainerHeight}
                        question={question}
                    />
                </QuestionContainer>

                <CountdownContainer>
                    <CountdownDisplay
                        changeHue
                        startTime={
                            currentQuestion ? currentQuestion.settings.time : 1
                        }
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
                <Button onClick={this.startInterview}>Start Interview</Button>
            </AppContainer>
        );
    }
}

App.propTypes = {
    // startRecording: PropTypes.func.isRequired,
    // stopRecording: PropTypes.func.isRequired,
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
