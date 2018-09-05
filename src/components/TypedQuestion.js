import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typed from 'typed.js';

const Container = styled.div`
    min-height: 250px;

    ${'' /* height: ${props => (props.Height ? props.Height : '400')}px; */} width: 100%;
`;

const QuestionContainer = styled.div`
    min-height: 250px;
    ${'' /* height: ${props => (props.Height ? props.Height : '400')}px; */} width: 700px;
    margin: 0 auto;
    ${'' /* background-color: lightgreen; */} text-align: center;
    font-size: 25px;
    font-weight: bold;
    word-wrap: break-word;
    padding: 10px;

    span {
        height: inherit;
        width: inherit;
        overflow: inherit;
        text-overflow: ellipsis;
    }
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
                typeSpeed: 10,
                backSpeed: 5,
                showCursor: false,
                smartBackspace: false,
            };
            console.log(options);
            this.typedInstance = new Typed(this.questionSpan, options);
        }
    }

    componentWillUnmount() {
        // Make sure to destroy Typed instance on unmounting
        // to prevent memory leaks
        if (this.typedInstance) this.typedInstance.destroy();
    }

    render() {
        const { Height } = this.props;

        return (
            <Container Height={Height}>
                <QuestionContainer>
                    <span
                        ref={questionSpan => {
                            this.questionSpan = questionSpan;
                        }}
                    />
                </QuestionContainer>
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
