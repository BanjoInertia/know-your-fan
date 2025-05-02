import styled, { keyframes } from 'styled-components';

const breakpoints = {
  tablet: '1200px',
  mobile: '800px',
};

const moveBackground = keyframes`
  from {
    background-position: 0 0;
  }
  to {
    background-position: var(--bg-size) var(--bg-size);
  }
`;

const StyledMain = styled.main`
  // --- Keep your existing styles ---
  display: ${({ $flex }) => ($flex ? 'flex' : 'block')};
  flex-direction: ${({ $flexDirection }) => $flexDirection || 'row'};
  align-items: ${({ $alignItems }) => $alignItems || 'stretch'};
  justify-content: ${({ $justifyContent }) => $justifyContent || 'flex-start'};
  gap: ${({ $gap }) => $gap || '0'};
  max-width: ${({ $maxWidth }) => $maxWidth || '100vw'};
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '100vh'};
  min-height: ${({ $minHeight }) => $minHeight || '100vh'};
  margin: ${({ $margin }) => $margin || '0 0'};
  padding: ${({ $padding }) => $padding || '0'};
  background-color: ${({ $bgColor }) => $bgColor || 'transparent'};
  border-radius: ${({ $radius }) => $radius || '0'};
  border: ${({ $border }) => $border || 'none'};
  overflow: hidden; // Keep this

  position: relative; // Keep this
  z-index: 0;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    --bg-size: ${({ $backgroundSize }) => $backgroundSize || '50px'}; // Provide a fallback
    background-image: ${({ $backgroundImage }) => $backgroundImage || 'none'};
    background-size: var(--bg-size);
    background-repeat: ${({ $backgroundRepeat }) => $backgroundRepeat || 'repeat'};
    transform: scale(5) rotate(-15deg);
    animation: ${moveBackground} 10s linear infinite;
    opacity: 0.08;
    z-index: -5;
    will-change: background-position;
  }

  @media (max-width: ${breakpoints.tablet}) {
    padding: ${({ $tabletPadding }) => $tabletPadding};
    height: ${({ $tabletHeight }) => $tabletHeight};
    min-height: ${({ $tabletMinHeight }) => $tabletMinHeight};
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: ${({ $mobilePadding }) => $mobilePadding};
  }
`;

export default function Main({
    children,
    ...rest
}) {
    return <StyledMain {...rest}>{children}</StyledMain>;
}