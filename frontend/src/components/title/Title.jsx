import styled from 'styled-components'

const breakpoints = {
  tablet: '1200px',
  mobile: '800px',
};

const StyledTitle = styled.p`
  font-size: ${({ $fontSize }) => $fontSize || '1.5rem'};
  font-weight: ${({ $fontWeight }) => $fontWeight || '400'};
  color: ${({ $color }) => $color || 'var(--font-color)'};
  margin: ${({ $margin }) => $margin || '0'};
  text-align: ${({ $align }) => $align || 'left'};
  line-height: ${({ $lineHeight }) => $lineHeight || '1'};
  display: ${({ $display }) => $display || 'block'};

  @media (max-width: ${breakpoints.tablet}) {
    font-size: ${({ $tabletFontSize }) => $tabletFontSize};
  }

  @media (max-width: ${breakpoints.mobile}) {
    font-size: ${({ $mobileFontSize }) => $mobileFontSize};
  }
`

export default function Title({
  children,
  as = 'h1',
  ...props
}) {
  return (
    <StyledTitle
      as={as}
      {...props}
    >
      {children}
    </StyledTitle>
  )
}
