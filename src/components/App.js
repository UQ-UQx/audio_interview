import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { startRecording, stopRecording } from '../actions';
// import { Row, Col } from 'reactstrap';
// import ApiTestButtons from './ApiTestButtons';
import InterviewCam from './InterviewCam';

const AppContainer = styled.div``;

const MediaVisualsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const WebcamContainer = styled.div`
    background-color: black;
`;

const AudioContainer = styled.div`
    background-color: blue;
    min-width: 300px;
    flex: 1 auto;
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
            record,
            screenshots,
        } = this.props;
        console.log(record, screenshots);

        return (
            <AppContainer>
                <MediaVisualsContainer>
                    <WebcamContainer>
                        <InterviewCam screenshotStreamInterval={5000} />
                    </WebcamContainer>

                    <AudioContainer>Audio container</AudioContainer>
                </MediaVisualsContainer>
                {screenshots.map((screenshot, index) => (
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
                    }}
                >
                    Start
                </Button>
                <Button
                    onClick={() => {
                        stopRecording();
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
    record: PropTypes.bool.isRequired,
    screenshots: PropTypes.arrayOf(PropTypes.string),
};

App.defaultProps = {
    screenshots: [],
};

export default withRouter(
    connect(
        state => ({
            record: state.record,
            screenshots: state.screenshots,
        }),
        {
            startRecording,
            stopRecording,
        }
    )(App)
);
