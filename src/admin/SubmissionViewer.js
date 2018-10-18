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
        };
    }

    render() {
        const { error } = this.state;
        const {
            submissionModal,
            toggleModal,
            student,
            submission,
        } = this.props;

        console.log('OPENING', student, submission);
        return (
            <ComponentContainer
                size="lg"
                isOpen={submissionModal}
                toggle={() => toggleModal(null)}
            >
                <ModalHeader toggle={() => toggleModal(null)}>
                    Submission From {student.name}
                </ModalHeader>
                <ModalBody>Submission</ModalBody>
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
