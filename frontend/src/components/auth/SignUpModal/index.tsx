import FormInputField from '@/components/FormInputField';
import LoadingButton from '@/components/LoadingButton';
import PasswordInputField from '@/components/PasswordInputField';
import * as UsersApi from '@/network/api/user';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

interface SignUpFormData {
  username: string;
  email: string;
  password: string;
}

interface SignUpModalProps {
  onDismiss: () => void;
  onLoginInsteadClick: () => void;
}

const SignUpModal = ({ onDismiss, onLoginInsteadClick }: SignUpModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>();

  const onSubmit = async (credentials: SignUpFormData) => {
    try {
      const newUser = await UsersApi.signUp(credentials);
      alert(JSON.stringify(newUser));
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <Modal show onHide={onDismiss} centered>
      <Modal.Header closeButton>
        <Modal.Title>Sign Up</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormInputField
            register={register('username')}
            label="Username"
            placeholder="Username"
            error={errors.username}
          />
          <FormInputField
            register={register('email')}
            type="email"
            label="Email"
            placeholder="Email"
            error={errors.email}
          />
          <PasswordInputField
            register={register('password')}
            placeholder="Password"
            label="Password"
            error={errors.password}
          />
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            className="w-100"
          >
            Sign Up
          </LoadingButton>
        </Form>
        <div className="d-flex align-items-center gap-1 justify-content-center mt-1">
          Already have an account?
          <Button variant="link">Log In</Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SignUpModal;
