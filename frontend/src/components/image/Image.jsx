import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledImage = styled(motion.img)`
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || 'auto'};
  object-fit: ${({ objectFit }) => objectFit || 'cover'};
  border-radius: ${({ borderRadius }) => borderRadius || '0'};
  margin: ${({ margin }) => margin || '0'};
  display: ${({ display }) => display || 'block'};
  max-width: ${({ maxWidth }) => maxWidth || '100%'};
  position: ${({ position }) => position || 'relative'};
  bottom: ${({ bottom }) => bottom || 'auto'};
  left: ${({ left }) => left || 'auto'};
  right: ${({ right }) => right || 'auto'};
  top: ${({ top }) => top || 'auto'};
  transform: ${({ transform }) => transform || 'none'};
  z-index: ${({ zIndex }) => zIndex || 'auto'};
  filter: ${({ filter }) => filter || 'none'};
  z-index: ${({ zIndex }) => zIndex || 'auto'};

  -webkit-user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
`;

export default function Image(props) {
  return <StyledImage {...props} />;
}
