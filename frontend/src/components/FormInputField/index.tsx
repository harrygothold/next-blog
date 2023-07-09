import { ComponentProps } from 'react';
import { Form, FormControlProps, InputGroup } from 'react-bootstrap';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface FormInputFieldProps extends FormControlProps {
  register: UseFormRegisterReturn;
  label?: string;
  error?: FieldError;
  inputGroupElement?: JSX.Element;
}

const FormInputField = ({
  register,
  label,
  error,
  inputGroupElement,
  ...rest
}: FormInputFieldProps & ComponentProps<'input'>) => {
  return (
    <Form.Group className="mb-3" controlId={`${register.name}-input`}>
      {label && (
        <Form.Label htmlFor={`${register.name}-input_md`}>{label}</Form.Label>
      )}
      <InputGroup hasValidation>
        <Form.Control
          {...register}
          {...rest}
          isInvalid={!!error}
          aria-describedby={inputGroupElement?.props.id}
        />
        {inputGroupElement}
        <Form.Control.Feedback type="invalid">
          {error?.message}
        </Form.Control.Feedback>
      </InputGroup>
    </Form.Group>
  );
};

export default FormInputField;
