import styled from 'styled-components'

const StyledInput = styled.input`
  padding: ${({ $padding }) => $padding || '0.5rem 1rem'};
  font-size: ${({ $fontSize }) => $fontSize || '1rem'};
  border: 1px solid ${({ $borderColor }) => $borderColor || 'var(--secondary-color)'};
  border-radius: ${({ $radius }) => $radius || '6px'};
  background-color: ${({ $bgColor }) => $bgColor || 'var(--primary-color)'};
  color: ${({ $textColor }) => $textColor || 'var(--secondary-color)'};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  box-shadow: 5px 5px 0 var(--secondary-color);
  text-transform: ${({ $textTransform }) => $textTransform || 'none'};
  text-align: ${({ $textAlign }) => $textAlign || 'left'};

  &:focus {
    outline: none;
    border-color: ${({ $focusColor }) => $focusColor || 'none'};
  }

  &::placeholder {
    color: ${({ $placeholderColor }) => $placeholderColor || 'var(--secondary-font-color)'};
  }

  &:disabled {
    background-color: var(--secondary-color);
    color: var(--tertiary-color);
    cursor: not-allowed;

    &::file-selector-button,
    &::-webkit-file-upload-button {
      background-color: var(--tertiary-color);
      cursor: not-allowed;
    }
  }

  &::file-selector-button,
  &::-webkit-file-upload-button {
    background-color: var(--secondary-color);
    color: var(--primary-color);
    padding: 0.6rem 1rem;
    border: 1px solid var(--primary-color);
    height: 100%;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 1rem;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: var(--primary-color);
      color: var(--secondary-color);
    }

    &:focus-visible {
      outline: 2px solid blue;
      outline-offset: 2px;
    }
  }
`

export default function Input({
  ...props
}) {
  return (
    <StyledInput
      {...props}
    />
  )
}
