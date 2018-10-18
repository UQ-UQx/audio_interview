import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Table, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SubmissionViewer from './SubmissionViewer';

const ComponentContainer = styled.div`
    margin-top: 50px;
`;

const VideoIcon = styled(FontAwesomeIcon)`
    margin-bottom: 3px;
    margin-left: 5px;
`;

class SubmissionsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            submissionModal: true,
            currentlyViewing: 'd8e6aa3c69b3185f4372295895808f5b',
        };
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal(userID) {
        console.log('TTTT', userID);
        const { submissionModal } = this.state;
        this.setState({
            submissionModal: !submissionModal,
            currentlyViewing: userID || null,
        });
    }

    render() {
        const { submissionModal, currentlyViewing } = this.state;
        const { submissions, students } = this.props;

        console.log(submissionModal);
        return (
            <ComponentContainer>
                <Table>
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Enrollment Mode</th>
                            <th>Verification Status</th>
                            <th>Submission</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(submissions).map(userID => (
                            <tr key={userID}>
                                <td>{userID}</td>
                                <td>{students[userID].username}</td>
                                <td>{students[userID].name}</td>
                                <td>{students[userID].enrollment_mode}</td>
                                <td>{students[userID].verification_status}</td>
                                <td>
                                    <Button
                                        color="info"
                                        onClick={() => {
                                            this.toggleModal(userID);
                                        }}
                                    >
                                        Click To View <VideoIcon icon="video" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <SubmissionViewer
                    submissionModal={submissionModal}
                    toggleModal={this.toggleModal}
                    submission={
                        currentlyViewing !== null
                            ? submissions[currentlyViewing]
                            : []
                    }
                    student={
                        currentlyViewing !== null
                            ? {
                                  ...students[currentlyViewing],
                                  id: currentlyViewing,
                              }
                            : { id: currentlyViewing }
                    }
                />
            </ComponentContainer>
        );
    }
}

SubmissionsTable.propTypes = {
    submissions: PropTypes.shape({}).isRequired,
    students: PropTypes.shape({}).isRequired,
};

export default SubmissionsTable;
