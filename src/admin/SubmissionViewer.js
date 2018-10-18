import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const ComponentContainer = styled(Modal)``;

class SubmissionViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            question: '',
            gapTime: 10,
            captureInterval: 5,
            session: [
                {
                    id: '4518e12a-958c-4098-976a-9242c0d5b8ac',
                    question:
                        'From your own experience and perspective, what is leadership?',
                    settings: { ask: true, time: 60 },
                },
                {
                    id: '62a2046d-45db-4061-85b6-5574732d2956',
                    question:
                        'What should a leader understand about change in organizations?',
                    settings: { ask: true, time: 60 },
                },
                {
                    id: '8ee94fd9-7567-4790-bdea-3a396e63a80f',
                    question:
                        'At your most recent workplace, what is one thing that could be done to better motivate and engage people?',
                    settings: { ask: true, time: 60 },
                },
                {
                    id: '47927955-34fd-48f6-9d6c-b0d280b5e5bb',
                    question:
                        'Wise leadership requires intellectual virtues and moral virtues. What do these terms mean, and how are they important to being an outstanding leader?',
                    settings: { ask: true, time: 60 },
                },
                {
                    id: '18ebf13b-7444-4965-9b92-975ff89e4741',
                    question:
                        'What are the key processes of Leadership Development?',
                    settings: { ask: true, time: 60 },
                },
            ],
        };

        this.startReplay = this.startReplay.bind(this);
    }

    startReplay() {
        const { gapTime, captureInterval, session, question } = this.state;

        // let sessionCopy = [...session];
        // this.replayInterval = setInterval(()=>{
        //     if(sessionCopy.length > 0){

        //     }

        // },1000)

        // 0 - 10
        // 10 - 70
        // 70 - 80
        // 80 - 120
        // 120 - 130
        // 130 - 180
        // 240 - 300
        // 300 - 360

        // gap
        // question
        // gap
        // question
        // gap

        const timestamps = {};
        let walkedTime = 0;

        session.forEach((question, index) => {
            walkedTime =
                index === 0 ? 10 : walkedTime + 10 + question.settings.time;
            timestamps[walkedTime] = question.question;
        });

        console.log(timestamps, gapTime, captureInterval, question);
    }

    render() {
        const { error } = this.state;
        const {
            submissionModal,
            toggleModal,
            student,
            submission,
        } = this.props;

        // (([-_]time[-_]))(.*)(([-_]time[-_])) regex to capture time

        const audioFilenameFilter = submission.filter(
            url => url === `audio_recording_${student.id}.webm`
        );

        const webcamCaptures = {};

        submission.forEach(url => {
            const result = /(([-_]time[-_]))(.*)(([-_]time[-_]))/.exec(url);
            if (result) {
                const timeStamp = result[3] === '' ? '0' : result[3];

                webcamCaptures[timeStamp] = url;
            }
        });

        console.log(Object.keys(webcamCaptures).length);

        const audioFilename = audioFilenameFilter[0]
            ? audioFilenameFilter[0]
            : null;

        console.log('OPENING', student, submission, audioFilename);
        return (
            <ComponentContainer
                size="lg"
                isOpen={submissionModal}
                toggle={() => toggleModal(null)}
            >
                <ModalHeader toggle={() => toggleModal(null)}>
                    Submission From <b>{student.name}</b>
                </ModalHeader>
                <ModalBody>
                    <div>Submission</div>
                    <Button onClick={this.startReplay}>Start</Button>
                </ModalBody>
                <ModalFooter>
                    {error !== '' ? error : ''}

                    <Button color="secondary" onClick={() => toggleModal(null)}>
                        Close
                    </Button>
                </ModalFooter>
            </ComponentContainer>
        );
    }
}

SubmissionViewer.propTypes = {
    student: PropTypes.shape({}).isRequired,
    submission: PropTypes.arrayOf(PropTypes.string).isRequired,
    submissionModal: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
};

export default SubmissionViewer;
