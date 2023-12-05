import styled from "styled-components";
import { FlexProps } from "./Flex";

export const StyledFlex = styled.div<FlexProps>`
    display: flex;
    flex-direction: ${props => props.flexDirection};
    justify-content: ${props => props.justifyContent};
    align-items: ${props => props.alignItems};
    gap: ${props => props.gap};
    height: ${props => props.height};
    width: ${props => props.width};
    padding: ${props => props.padding};
    align-self: ${props => props.alignSelf};
`;