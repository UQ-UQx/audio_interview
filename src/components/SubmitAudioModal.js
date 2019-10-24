import React, { Component } from 'react';
import styled from 'styled-components';
import { Modal } from 'reactstrap';
import SubmissionsStudentDataModal from '../admin/SubmissionsStudentDataModal';

const AudioUploadModal = styled(Modal)`
    width: 80%;
`;

export default class SubmitAudioModal extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log('SubmitAudio', this.state, this.props);
        const { isOpen, toggle } = this.props;

        return (
            <AudioUploadModal
                size="lg"
                isOpen={isOpen}
                toggle={this.toggleModal}
            >
                <SubmissionsStudentDataModal toggleModal />
            </AudioUploadModal>
        );
    }
}
