import styled from 'styled-components';

const breakpoints = {
  tablet: '1200px',
  tablet2: '1000px',
  mobile: '800px',
};

const StyledContainer = styled.div`
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
  border-radius: ${({ $radius }) => $radius || '0'};
  border: ${({ $border }) => $border || 'none'};
  box-shadow: ${({ $boxShadow }) => $boxShadow || 'none'};
  position: ${({ $position }) => $position || 'relative'};
  cursor: ${({ $onClick }) => ($onClick ? 'pointer' : 'default')};
  transition: padding 0.5s ease-out, gap 0.5s ease-out;
  flex: ${({ $flexN }) => (typeof $flexN === 'number' ? $flexN : 'initial')};
  text-align: ${({ $textAlign }) => $textAlign || 'left'};

  @media (max-width: ${breakpoints.tablet}) {
    width: ${({ $tabletWidth }) => $tabletWidth};
    flex-direction: ${({ $tabletFlexDirection }) => $tabletFlexDirection};
    align-items: ${({ $tabletAlignItems }) => $tabletAlignItems};
    justify-content: ${({ $tabletJustifyContent }) => $tabletJustifyContent};
    gap: ${({ $tabletGap }) => $tabletGap};
    padding: ${({ $tabletPadding }) => $tabletPadding};
    margin: ${({ $tabletMargin }) => $tabletMargin};
    height: ${({ $tabletHeight }) => $tabletHeight};
    min-height: ${({ $tabletMinHeight }) => $tabletMinHeight};

  @media (max-width: ${breakpoints.tablet2}) {
    width: ${({ $tablet2Width }) => $tablet2Width};
    flex-direction: ${({ $tablet2FlexDirection }) => $tablet2FlexDirection};
    align-items: ${({ $tablet2AlignItems }) => $tablet2AlignItems};
    justify-content: ${({ $tablet2JustifyContent }) => $tablet2JustifyContent};
    gap: ${({ $tablet2Gap }) => $tablet2Gap};
    margin: ${({ $tablet2Margin }) => $tablet2Margin};
  }

  @media (max-width: ${breakpoints.mobile}) {
    width: ${({ $mobileWidth }) => $mobileWidth};
    padding: ${({ $mobilePadding }) => $mobilePadding};
    gap: ${({ $mobileGap }) => $mobileGap};
    flex-direction: ${({ $mobileFlexDirection }) => $mobileFlexDirection};
    height: ${({ $mobileHeight }) => $mobileHeight};
    width: ${({ $mobileWidth }) => $mobileWidth};
  }
`;

export default function Container(allReceivedProps) {
// eslint-disable-next-line no-unused-vars
  const { children, layout, ...domProps } = allReceivedProps;

  return <StyledContainer {...domProps}>{children}</StyledContainer>;
}