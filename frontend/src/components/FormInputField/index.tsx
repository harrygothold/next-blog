import { ComponentProps } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface FormInputFieldProps extends FormControlProps {
  register: UseFormRegisterReturn;
  label?: string;
  error?: FieldError;
}

const FormInputField = ({
  register,
  label,
  error,
  ...rest
}: FormInputFieldProps & ComponentProps<'input'>) => {
  return (
    <Form.Group className="mb-3" controlId={`${register.name}-input`}>
      {label && (
        <Form.Label htmlFor={`${register.name}-input_md`}>{label}</Form.Label>
      )}
      <Form.Control {...register} {...rest} isInvalid={!!error} />
      <Form.Control.Feedback type="invalid">
        {error?.message}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default FormInputField;
