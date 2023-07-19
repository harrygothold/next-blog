import dynamic from 'next/dynamic';
import { Form } from 'react-bootstrap';
import {
  FieldError,
  UseFormRegisterReturn,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import * as BlogApi from '@/network/api/blog';
import Markdown from '../Markdown';

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
});

interface MarkdownEditorProps {
  register: UseFormRegisterReturn;
  label?: string;
  error?: FieldError;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  editorHeight?: number;
}

const MarkdownEditor = ({
  register,
  label,
  error,
  watch,
  setValue,
  editorHeight = 500,
}: MarkdownEditorProps) => {
  const uploadInPostImage = async (image: File) => {
    try {
      const response = await BlogApi.uploadInPostImage(image);
      return response.imageUrl;
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <Form.Group className="mb-3">
      {label && <Form.Label>{label}</Form.Label>}
      <MdEditor
        {...register}
        id={`${register.name}-input`}
        renderHTML={(text) => <Markdown>{text}</Markdown>}
        value={watch(register.name)}
        onChange={({ text }) =>
          setValue(register.name, text, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        className={error ? 'is-invalid' : ''}
        style={{ height: editorHeight }}
        placeholder="Write something..."
        onImageUpload={uploadInPostImage}
        imageAccept=".jpg,.png"
      />
      <Form.Control.Feedback type="invalid">
        {error?.message}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default MarkdownEditor;
