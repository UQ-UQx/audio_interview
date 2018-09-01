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
} from '../actions';
// import { Row, Col } from 'reactstrap';
// import ApiTestButtons from './ApiTestButtons';
import InterviewCam from './InterviewCam';
import TypedQuestion from './TypedQuestion';

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
    flex: 1;
    flex-flow: column;
`;

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const {
            startRecording,
            stopRecording,
            screenshots,
            question,
            askQuestion,
            clearQuestion,
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

                    <QuestionContainer>
                        <TypedQuestion
                            Height={mediaContainerHeight}
                            question={question}
                        />
                    </QuestionContainer>
                </MediaVisualsContainer>
                {[...screenshots].reverse().map((screenshot, index) => (
                    <img
                        key={screenshot}
                        width="100px"
                        src={screenshot}
                        alt={`user face screenshot ${index}`}
                    />
                ))}
                <Button
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
                </Button>
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
        }),
        {
            startRecording,
            stopRecording,
            askQuestion,
            clearQuestion,
        }
    )(App)
);
