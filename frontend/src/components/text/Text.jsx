import styled from 'styled-components';

const breakpoints = {
  tablet: '1200px',
  mobile: '800px',
};

const StyledText = styled.p`
  /* Default styles using props */
  font-size: ${({ $fontSize }) => $fontSize || '1rem'};
  font-weight: ${({ $fontWeight }) => $fontWeight || '400'};
  color: ${({ $color }) => $color || 'var(--font-color)'};
  margin: ${({ $margin }) => $margin || '0'};
  text-align: ${({ $align }) => $align || 'left'};
  line-height: ${({ $lineHeight }) => $lineHeight || '1.5'};
  display: ${({ $display }) => $display || 'block'};
  text-transform: ${({ $textTransform }) => $textTransform || 'none'};

  @media (max-width: ${breakpoints.tablet}) {
    font-size: calc(${({ $tabletFontSize }) => $tabletFontSize || '1rem'} * 0.7);
    text-align: center;
  }

  @media (max-width: ${breakpoints.mobile}) {
    font-size: calc(${({ $mobileFontSize }) => $mobileFontSize || '1rem'} * 0.6);
    line-height: 1.4;
  }
`;

export default function Text({
  children,
  ...props
}) {
  return <StyledText {...props}>{children}</StyledText>
}