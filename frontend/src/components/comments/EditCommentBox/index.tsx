import { Comment } from '@/models/comment';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import * as BlogApi from '@/network/api/blog';
import { Button, Form } from 'react-bootstrap';
import FormInputField from '@/components/FormInputField';
import LoadingButton from '@/components/LoadingButton';
import { useEffect } from 'react';

const validationSchema = yup.object({
  text: yup.string(),
});

type UpdateCommentInput = yup.InferType<typeof validationSchema>;

interface EditCommentBoxProps {
  comment: Comment;
  onCommentUpdated: (updatedComment: Comment) => void;
  onCancel: () => void;
}

const EditCommentBox = ({
  comment,
  onCommentUpdated,
  onCancel,
}: EditCommentBoxProps) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    setFocus,
  } = useForm<UpdateCommentInput>({
    defaultValues: { text: comment.text },
    // @ts-ignore
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async ({ text }: UpdateCommentInput) => {
    if (!text) return;

    try {
      const updatedComment = await BlogApi.updateComment(comment._id, text);
      onCommentUpdated(updatedComment);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  useEffect(() => {
    setFocus('text');
  }, [setFocus]);

  return (
    <div className="mt-2">
      <div className="mb-1">Edit Comment</div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormInputField
          register={register('text')}
          as="textarea"
          maxLength={600}
        />
        <LoadingButton type="submit" isLoading={isSubmitting}>
          Submit
        </LoadingButton>
        <Button onClick={onCancel} className="ms-2" variant="outline-primary">
          Cancel
        </Button>
      </Form>
    </div>
  );
};

export default EditCommentBox;
