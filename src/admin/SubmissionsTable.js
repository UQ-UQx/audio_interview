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
            submissionModal: false,
            currentlyViewing: null,
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
        const { submissions, students, submissionsMetaData, resetStudent } = this.props;

        console.log('submissionsMeta: ', submissions, submissionsMetaData);
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
                        {Object.keys(submissionsMetaData).map(userID => (
                            <tr key={userID}>
                                <td>{userID}</td>
                                <td>
                                    {students[userID]
                                        ? students[userID].username
                                        : 'Unknown'}
                                </td>
                                <td>
                                    {students[userID]
                                        ? students[userID].name
                                        : 'Unknown'}
                                </td>
                                <td>
                                    {students[userID]
                                        ? students[userID].enrollment_mode
                                        : 'Unknown'}
                                </td>
                                <td>
                                    {students[userID]
                                        ? students[userID].verification_status
                                        : 'Unknown'}
                                </td>
                                <td>
                                    
                                    <Button
                                        color="info"
                                        onClick={() => {
                                            this.toggleModal(userID);
                                        }}
                                    >
                                        {// Check if submission has a corresponding upload
                                        submissions[userID] ? (`Click To View ${<VideoIcon icon="video" />}`) : 'No Upload found'}
                                    </Button>
                                    
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {currentlyViewing ? (
                    <SubmissionViewer
                        submissionModal={submissionModal}
                        toggleModal={this.toggleModal}
                        resetStudent={resetStudent}
                        submissionMetaData={
                            currentlyViewing !== null
                                ? submissionsMetaData[currentlyViewing]
                                : { questions: '[]', submitted: '' }
                        }
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
                ) : (
                    ''
                )}
            </ComponentContainer>
        );
    }
}

SubmissionsTable.propTypes = {
    submissions: PropTypes.shape({}).isRequired,
    students: PropTypes.shape({}).isRequired,
    submissionsMetaData: PropTypes.shape({}).isRequired,
};

export default SubmissionsTable;
