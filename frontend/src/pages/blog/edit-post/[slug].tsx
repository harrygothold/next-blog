import ConfirmationModal from '@/components/ConfirmationModal';
import FormInputField from '@/components/FormInputField';
import LoadingButton from '@/components/LoadingButton';
import MarkdownEditor from '@/components/MarkdownEditor';
import useAuthenticatedUser from '@/hooks/useAuthenticatedUser';
import useUnsavedChangesWarning from '@/hooks/useUnsavedChangesWarning';
import { BlogPost } from '@/models/blog-post';
import * as BlogApi from '@/network/api/blog';
import { NotFoundError } from '@/network/http-errors';
import { generateSlug } from '@/utils/utils';
import { slugSchema, requiredStringSchema } from '@/utils/validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

export const getServerSideProps: GetServerSideProps<
  EditBlogPostPageProps
> = async ({ params }) => {
  try {
    const slug = params?.slug?.toString();
    if (!slug) throw Error('slug missing');

    const post = await BlogApi.getBlogPostBySlug(slug);

    return { props: { post } };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { notFound: true };
    } else {
      throw error;
    }
  }
};

interface EditBlogPostPageProps {
  post: BlogPost;
}

const validationSchema = yup.object({
  slug: slugSchema.required('This field is required'),
  title: requiredStringSchema,
  summary: requiredStringSchema,
  body: requiredStringSchema,
  featuredImage: yup.mixed<FileList>(),
});

type EditPostFormData = yup.InferType<typeof validationSchema>;

const EditBlogPostPage = ({ post }: EditBlogPostPageProps) => {
  const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] =
    useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const { user, userLoading } = useAuthenticatedUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditPostFormData>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      body: post.body,
    },
  });

  const generateSlugFromTitle = () => {
    if (getValues('slug')) return;
    const slug = generateSlug(getValues('title'));
    setValue('slug', slug, { shouldValidate: true });
  };

  const onSubmit = async ({
    slug,
    title,
    summary,
    body,
    featuredImage,
  }: EditPostFormData) => {
    try {
      await BlogApi.updateBlogPost(post._id, {
        slug,
        title,
        summary,
        body,
        featuredImage: featuredImage?.item(0) || undefined,
      });
      await router.push(`/blog/${slug}`);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  const onDeleteConfirmed = async () => {
    setShowDeleteConfirmationDialog(false);
    setDeletePending(true);
    try {
      await BlogApi.deleteBlogPost(post._id);
      router.push('/blog');
    } catch (error) {
      setDeletePending(false);
      console.error(error);
      alert(error);
    }
  };

  useUnsavedChangesWarning(isDirty && !isSubmitting && !deletePending);

  const userIsAuthorized = (user && user._id === post.author._id) || false;

  if (!userLoading && !userIsAuthorized) {
    return <p>You are not authorized to edit this post</p>;
  }

  if (userLoading)
    return <Spinner animation="border" className="d-block m-auto" />;

  return (
    <div>
      <h1>Edit post</h1>
      {userIsAuthorized && (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormInputField
            label="Post Title"
            register={register('title')}
            placeholder="Post Title"
            maxLength={100}
            error={errors.title}
            onBlur={generateSlugFromTitle}
          />
          <FormInputField
            label="Post Slug"
            register={register('slug')}
            placeholder="Post Slug"
            maxLength={100}
            error={errors.slug}
          />
          <FormInputField
            label="Post Summary"
            register={register('summary')}
            placeholder="Post Summary"
            maxLength={300}
            as="textarea"
            error={errors.summary}
          />
          <FormInputField
            label="Post Image"
            register={register('featuredImage')}
            type="file"
            accept="image/png,image/jpg"
            error={errors.featuredImage}
          />
          <MarkdownEditor
            label="Post Body"
            register={register('body')}
            error={errors.body}
            watch={watch}
            setValue={setValue}
            editorHeight={600}
          />
          <div className="d-flex justify-content-between">
            <LoadingButton
              isLoading={isSubmitting}
              type="submit"
              disabled={deletePending}
            >
              Update Post
            </LoadingButton>
            <Button
              onClick={() => setShowDeleteConfirmationDialog(true)}
              variant="outline-danger"
              disabled={deletePending}
            >
              Delete Post
            </Button>
          </div>
        </Form>
      )}
      <ConfirmationModal
        show={showDeleteConfirmationDialog}
        title="Confirm Delete"
        message="Do you really want to delete this post?"
        confirmButtonText="Delete"
        onCancel={() => setShowDeleteConfirmationDialog(false)}
        onConfirm={onDeleteConfirmed}
      />
    </div>
  );
};

export default EditBlogPostPage;
