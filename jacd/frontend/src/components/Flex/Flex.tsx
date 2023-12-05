import React from 'react';
import * as Styled from './styled';

export interface FlexProps {
    children?: React.ReactNode;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    gap?: string;
    height?: string;
    width?: string;
    padding?: string;
    alignSelf?: string;
    margin?: string;
}

const Flex = (props: FlexProps) => {
    const { children } = props;
    return (
        <Styled.StyledFlex {...props}>
            {children}
        </Styled.StyledFlex>
    );
};

export default Flex;