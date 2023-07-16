import FormInputField from '@/components/FormInputField';
import LoadingButton from '@/components/LoadingButton';
import PasswordInputField from '@/components/PasswordInputField';
import useAuthenticatedUser from '@/hooks/useAuthenticatedUser';
import useCountdown from '@/hooks/useCountdown';
import * as UsersApi from '@/network/api/user';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/network/http-errors';
import {
  emailSchema,
  passwordSchema,
  requiredStringSchema,
} from '@/utils/validation';
import { useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const validationSchema = yup.object({
  email: emailSchema.required('Required'),
  password: passwordSchema.required('Required'),
  verificationCode: requiredStringSchema,
});

type ResetPasswordFormData = yup.InferType<typeof validationSchema>;

interface ResetPasswordModalProps {
  onDismiss: () => void;
  onSignUpClicked: () => void;
}

const ResetPasswordModal = ({
  onDismiss,
  onSignUpClicked,
}: ResetPasswordModalProps) => {
  const [verificationCodeRequestPending, setVerificationCodeRequestPending] =
    useState(false);
  const [showVerificationCodeSentText, setShowVerificationCodeSentText] =
    useState(false);

  const {
    secondsLeft: verificationCodeCooldownSecondsLeft,
    start: startVerificationCodeCooldown,
  } = useCountdown();

  const [errorText, setErrorText] = useState<string | null>(null);
  const { mutateUser } = useAuthenticatedUser();
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (credentials: ResetPasswordFormData) => {
    try {
      setErrorText(null);
      setShowVerificationCodeSentText(false);
      const user = await UsersApi.resetPassword(credentials);
      mutateUser(user);
      onDismiss();
    } catch (error) {
      if (error instanceof ConflictError || error instanceof BadRequestError) {
        setErrorText(error.message);
      } else {
        console.error(error);
        alert(error);
      }
    }
  };

  const requestVerificationCode = async () => {
    const validEmailInput = await trigger('email');
    if (!validEmailInput) return;

    const emailInput = getValues('email');
    setErrorText(null);
    setShowVerificationCodeSentText(false);
    setVerificationCodeRequestPending(true);

    try {
      await UsersApi.requestPasswordResetCode(emailInput);
      setShowVerificationCodeSentText(true);
      startVerificationCodeCooldown(60);
    } catch (error) {
      if (error instanceof NotFoundError) {
        setErrorText(error.message);
      } else {
        console.error(error);
        alert(error);
      }
    } finally {
      setVerificationCodeRequestPending(false);
    }
  };

  return (
    <Modal show onHide={onDismiss} centered>
      <Modal.Header closeButton>
        <Modal.Title>Reset Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorText && <Alert variant="danger">{errorText}</Alert>}
        {showVerificationCodeSentText && (
          <Alert variant="warning">
            We sent you a verification code. Please check your inbox!
          </Alert>
        )}
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormInputField
            register={register('email')}
            type="email"
            label="Email"
            placeholder="Email"
            error={errors.email}
          />
          <PasswordInputField
            register={register('password')}
            placeholder="New Password"
            label="New Password"
            error={errors.password}
          />
          <FormInputField
            register={register('verificationCode')}
            type="number"
            label="Verification Code"
            placeholder="Verification Code"
            error={errors.verificationCode}
            inputGroupElement={
              <Button
                id="button-send-verification-code"
                disabled={
                  verificationCodeRequestPending ||
                  verificationCodeCooldownSecondsLeft > 0
                }
                onClick={requestVerificationCode}
              >
                Send Code
                {verificationCodeCooldownSecondsLeft > 0 &&
                  `(${verificationCodeCooldownSecondsLeft}s)`}
              </Button>
            }
          />
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
          <Button onClick={onSignUpClicked} variant="link">
            Sign Up
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ResetPasswordModal;
