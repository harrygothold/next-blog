import { Button, Modal } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';

interface ConfirmationModalProps {
  show: boolean;
  title?: string;
  message: string;
  confirmButtonText: string;
  variant?: Variant;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal = ({
  show,
  title,
  message,
  confirmButtonText,
  variant,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      {title && (
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      )}
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button onClick={onCancel} variant="outline-secondary">
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
