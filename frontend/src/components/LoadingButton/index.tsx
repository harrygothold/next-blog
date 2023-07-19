import { ReactNode } from 'react';
import { Button, ButtonProps, Spinner } from 'react-bootstrap';

interface LoadingButtonProps {
  isLoading: boolean;
  children: ReactNode;
}

const LoadingButton = ({
  children,
  isLoading,
  ...rest
}: LoadingButtonProps & ButtonProps) => {
  return (
    <Button {...rest} disabled={isLoading || rest.disabled}>
      {isLoading && (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="state"
            aria-hidden="true"
          />
          <span className="visually-hidden">Loading...</span>{' '}
        </>
      )}
      {children}
    </Button>
  );
};

export default LoadingButton;
