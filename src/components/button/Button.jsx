import styled, { css } from 'styled-components'

const StyledButton = styled.button`
  background-color: ${({ $bgColor }) => $bgColor || 'var(--primary-color)'};
  color: ${({ $textColor }) => $textColor || 'var(--font-color)'};
  padding: ${({ $padding }) => $padding || '0.5rem 1rem'};
  margin: ${({ $margin }) => $margin || '0'};
  font-size: ${({ $fontSize }) => $fontSize || '2rem'};
  border: 1px solid ${({ $borderColor }) => $borderColor || 'var(--secondary-color)'};
  border-radius: ${({ $borderRadius }) => $borderRadius || '8px'};
  cursor: pointer;
  font-weight: 600;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  box-shadow: ${({ $boxShadow }) => $boxShadow || '5px 5px 0 var(--secondary-color)'};
  transition: all 0.3s ease;

  ${({ $isActive }) =>
    $isActive &&
    css`
      color: var(--primary-color);
      border-color: var(--primary-color);
      font-weight: 700;
      transform: translate(3px, 3px);
      background-color: var(--secondary-color);
      box-shadow: 6px 6px 0 var(--primary-color);
    `}

  &:hover:not(:disabled) {
    opacity: 0.9;
    ${({ $isActive }) =>
      !$isActive &&
      css`
        background-color: var(--tertiary-color);
        box-shadow: 6px 6px 0 var(--secondary-color);
        transform: translate(-1px, -1px);
      `}
  }

  &:disabled {
    background-color: var(--tertiary-color);
    cursor: not-allowed;
  }

   &:disabled {
    background-color: var(--tertiary-color);
    color: var(--disabled-font-color);
    border-color: var(--disabled-border-color);
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;
  }
`

export default function Button({
    children,
    ...props
}) {
    return (
        <StyledButton
            {...props}
        >
            {children}
        </StyledButton>
    )
}
