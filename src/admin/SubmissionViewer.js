import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import uuidv4 from 'uuid/v4';

import InterviewPlayer from './InterviewPlayer';

const ComponentContainer = styled(Modal)``;

class SubmissionViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            question: '',
            gapTime: 10,
        };

        // this.startReplay = this.startReplay.bind(this);
        this.onPlayerProgress = this.onPlayerProgress.bind(this);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    onPlayerProgress(progress) {
        const { question } = this.state;

        console.log('CVALLING', progress, question);
    }

    render() {
        const { error, gapTime } = this.state;
        const {
            submissionModal,
            toggleModal,
            student,
            submission,
            submissionMetaData,
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

                const rounded =
                    Math.round(parseFloat(timeStamp).toFixed() * 10) / 10;

                webcamCaptures[rounded.toString()] = url;
            }
        });

        // console.log(Object.keys(webcamCaptures).length);

        const audioFilename = audioFilenameFilter[0]
            ? audioFilenameFilter[0]
            : null;

        // console.log('OPENING', student, submission, audioFilename);

        const audioURL = `./media/recordings/${$LTI.courseID}/${$LTI.id}/${
            student.id
        }/${audioFilename}`;

        const timestamps = {};
        let walkedTime = 0;

        const gap = {
            id: uuidv4(),
            question: '',
            settings: {
                time: gapTime,
            },
        };
        timestamps[0] = { ...gap };

        JSON.parse(submissionMetaData.questions).forEach((question, index) => {
            walkedTime =
                index === 0 ? 10 : walkedTime + 10 + question.settings.time;
            timestamps[walkedTime] = question;
            timestamps[walkedTime + question.settings.time] = { ...gap };
        });

        // const audioURL = 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.webm';
        return (
            <ComponentContainer
                size="lg"
                isOpen={submissionModal}
                toggle={() => toggleModal(null)}
            >
                <ModalHeader toggle={() => toggleModal(null)}>
                    Submission Player
                </ModalHeader>
                <ModalBody>
                    <InterviewPlayer
                        audioURL={audioURL}
                        images={webcamCaptures}
                        questions={timestamps}
                        student={student}
                        submitted={submissionMetaData.submitted}
                    />
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
    submissionMetaData: PropTypes.shape({}).isRequired,
};

export default SubmissionViewer;
