import styled from 'styled-components'

const breakpoints = {
  tablet2: '1200px',
  mobile: '800px',
};

const StyledSection = styled.section`
  display: ${({ $flex }) => ($flex ? 'flex' : 'block')};
  flex-direction: ${({ $flexDirection }) => $flexDirection || 'row'};
  align-items: ${({ $alignItems }) => $alignItems || 'stretch'};
  justify-content: ${({ $justifyContent }) => $justifyContent || 'flex-start'};
  gap: ${({ $gap }) => $gap || '0'};
  max-width: ${({ $maxWidth }) => $maxWidth || '100vw'};
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '100%'};
  margin: ${({ $margin }) => $margin || '0 0'};
  padding: ${({ $padding }) => $padding || '0'};
  background-color: ${({ $bgColor }) => $bgColor || 'transparent'};
  background-image: ${({ $backgroundImage }) => $backgroundImage || 'none'};
  background-size: ${({ $backgroundSize }) => $backgroundSize || 'cover'};
  background-position: ${({ $backgroundPosition }) => $backgroundPosition || 'center'};
  background-repeat: ${({ $backgroundRepeat }) => $backgroundRepeat || 'no-repeat'};
  border-radius: ${({ $radius }) => $radius || '0'};
  border: ${({ $border }) => $border || 'none'};
  box-shadow: ${({ $boxShadow }) => $boxShadow || 'none'};
  backdrop-filter: ${({ $backdropFilter }) => $backdropFilter || 'none'};
  min-height: ${({ $minHeight }) => $minHeight || '0'};

  @media (max-width: ${breakpoints.mobile}) {
    width: ${({ $mobileWidth }) => $mobileWidth};
    padding: ${({ $mobilePadding }) => $mobilePadding};
    gap: ${({ $mobileGap }) => $mobileGap};
    flex-direction: ${({ $mobileFlexDirection }) => $mobileFlexDirection};
    height: ${({ $mobileHeight }) => $mobileHeight};
  }

  @media (max-width: ${breakpoints.tablet2}) {
    width: ${({ $tablet2Width }) => $tablet2Width};
    flex-direction: ${({ $tablet2FlexDirection }) => $tablet2FlexDirection};
    align-items: ${({ $tablet2AlignItems }) => $tablet2AlignItems};
    gap: ${({ $tablet2Gap }) => $tablet2Gap};
`

export default function Section({
    children,
    ...props
}) {
    return <StyledSection {...props}>{children}</StyledSection>
}
