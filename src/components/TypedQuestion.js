import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typed from 'typed.js';

const Container = styled.div`
    height: ${props => (props.Height ? props.Height : '400')}px;

    width: 100%;
`;

const Question = styled.div`
    height: ${props => (props.Height ? props.Height : '400')}px;
    text-align: center;
    font-size: 25px;
    font-weight: bold;
    word-wrap: break-word;
    padding: 10px;
    flex: 1;
    justify-content: 'center';
    align-items: 'center';
`;

class TypedQuestion extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidUpdate(prevProps) {
        const prevQuestion = prevProps.question;
        const { question } = this.props;

        if (prevQuestion !== question) {
            const options = {
                strings: [prevQuestion, question],
                typeSpeed: 50,
                backSpeed: 50,
                showCursor: false,
                smartBackspace: false,
            };
            console.log(options);
            this.typed = new Typed(this.questionSpan, options);
        }
    }

    componentWillUnmount() {
        // Make sure to destroy Typed instance on unmounting
        // to prevent memory leaks
        if (this.typed) this.typed.destroy();
    }

    render() {
        const { Height } = this.props;

        return (
            <Container Height={Height}>
                <Question>
                    <span
                        style={{ whiteSpace: 'pre' }}
                        ref={questionSpan => {
                            this.questionSpan = questionSpan;
                        }}
                    />
                </Question>
            </Container>
        );
    }
}

TypedQuestion.propTypes = {
    Height: PropTypes.number,
    question: PropTypes.string,
};

TypedQuestion.defaultProps = {
    Height: 400,
    question: '',
};

export default TypedQuestion;
