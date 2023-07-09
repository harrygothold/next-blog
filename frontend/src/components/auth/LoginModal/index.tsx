import { useForm } from 'react-hook-form';
import * as UsersApi from '@/network/api/user';
import { Button, Form, Modal } from 'react-bootstrap';
import FormInputField from '@/components/FormInputField';
import PasswordInputField from '@/components/PasswordInputField';
import LoadingButton from '@/components/LoadingButton';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginModalProps {
  onDismiss: () => void;
  onSignUpInsteadClicked: () => void;
  onForgotPasswordClicked: () => void;
}

const LoginModal = ({
  onDismiss,
  onSignUpInsteadClicked,
  onForgotPasswordClicked,
}: LoginModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (credentials: LoginFormData) => {
    try {
      const user = await UsersApi.login(credentials);
      alert(JSON.stringify(user));
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <Modal show onHide={onDismiss} centered>
      <Modal.Header closeButton>
        <Modal.Title>Log In</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormInputField
            register={register('username')}
            label="Username"
            placeholder="Username"
            error={errors.username}
          />
          <PasswordInputField
            register={register('password')}
            placeholder="Password"
            label="Password"
            error={errors.password}
          />
          <Button
            variant="link"
            className="d-block ms-auto mt-n3 mb-3 small"
            onClick={onForgotPasswordClicked}
          >
            Forgot Password?
          </Button>
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            className="w-100"
          >
            Log In
          </LoadingButton>
        </Form>
        <div className="d-flex align-items-center gap-1 justify-content-center mt-1">
          Don&apos;t have an account yet?
          <Button variant="link">Sign Up</Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;
