import React, { Component } from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Alert, Button, Modal } from 'reactstrap';
// import SubmitAudioContainer from './SubmitAudioModal';
import SubmissionsStudentDataModal from '../admin/SubmissionsStudentDataModal';

const AudioUploadModal = styled(Modal)`
    width: 80%;
`;

class Msg extends Component {
    constructor(props) {
        super(props);

        this.state = {
            uploadmodal: false,
        };

        this.setModalOpen = this.setModalOpen.bind();
        this.toggleModal = this.toggleModal.bind();
    }

    setModalOpen(open) {
        this.setState({
            uploadmodal: open,
        });
    }

    toggleModal() {
        const { uploadmodal } = this.state;

        this.setState({
            uploadmodal: !uploadmodal,
        });
    }

    render() {
        const { uploadmodal } = this.state;

        return (
            <div>
                <AudioUploadModal
                    size="lg"
                    isOpen={uploadmodal}
                    toggle={this.toggleModal}
                >
                    <SubmissionsStudentDataModal toggleModal />
                </AudioUploadModal>
                <Alert
                    color="warning"
                    style={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                    }}
                >
                    <p>
                        Our records indicate your interview was interrupted
                        before submission, please contact the course team to
                        reset this activity or email your downloaded files to the course team.
                    </p>
                    {/*
                    <Button
                        color="primary"
                        onClick={() => {
                            this.setState({ uploadmodal: true });
                        }}
                    >
                        Click to upload your Recorded Audio File
                    </Button>
                    */}
                </Alert>
            </div>
        );
    }
}

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
        {}
    )(Msg)
);
