import React, { Component } from 'react';
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

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            questions: [],
        };
        this.startInterview = this.startInterview.bind(this);
        this.changeQuestion = this.changeQuestion.bind(this);
    }

    componentWillUnmount() {
        if (this.timeout) clearTimeout(this.timeout);
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
            console.log(list);

            const question = list.pop();

            this.setState({ questions: list });
            askQuestion(question.question);

            const nextQuestion = list.pop();

            this.timeout = setTimeout(
                () => this.changeQuestion(nextQuestion),
                question.settings.time * 1000
            );
        }).catch(error => {
            console.error(error);
        });
    }

    changeQuestion(question) {
        const { askQuestion } = this.props;
        const { questions } = this.state;

        if (questions.length === 0) {
            askQuestion('');
            return;
        }

        const list = [...questions];

        askQuestion(question.question);

        const nextQuestion = list.pop();

        this.setState({ questions: list });

        this.timeout = setTimeout(
            () => this.changeQuestion(nextQuestion),
            question.settings.time * 1000
        );
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
    // clearQuestion: PropTypes.func.isRequired,
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
