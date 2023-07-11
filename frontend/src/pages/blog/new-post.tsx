import FormInputField from '@/components/FormInputField';
import LoadingButton from '@/components/LoadingButton';
import MarkdownEditor from '@/components/MarkdownEditor';
import * as BlogApi from '@/network/api/blog';
import { generateSlug } from '@/utils/utils';
import { useRouter } from 'next/router';
import { Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  requiredFileSchema,
  requiredStringSchema,
  slugSchema,
} from '@/utils/validation';
import useAuthenticatedUser from '@/hooks/useAuthenticatedUser';
import useUnsavedChangesWarning from '@/hooks/useUnsavedChangesWarning';

const validationSchema = yup.object({
  slug: slugSchema.required('This field is required'),
  title: requiredStringSchema,
  summary: requiredStringSchema,
  body: requiredStringSchema,
  featuredImage: requiredFileSchema,
});

type CreatePostFormData = yup.InferType<typeof validationSchema>;

const CreateBlogPost = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreatePostFormData>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
  });

  useUnsavedChangesWarning(isDirty && !isSubmitting);

  const { user, userLoading } = useAuthenticatedUser();
  const router = useRouter();

  const onSubmit = async ({
    title,
    slug,
    summary,
    featuredImage,
    body,
  }: CreatePostFormData) => {
    try {
      await BlogApi.createBlogPost({
        title,
        slug,
        summary,
        body,
        featuredImage: featuredImage[0],
      });
      await router.push(`/blog/${slug}`);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  const generateSlugFromTitle = () => {
    if (getValues('slug')) return;
    const slug = generateSlug(getValues('title'));
    setValue('slug', slug, { shouldValidate: true });
  };

  if (userLoading) {
    return <Spinner animation="border" className="d-block m-auto" />;
  }

  if (!userLoading && !user) router.push('/');

  return (
    <div>
      <h1>Create a post</h1>
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
        <LoadingButton isLoading={isSubmitting} type="submit">
          Create Post
        </LoadingButton>
      </Form>
    </div>
  );
};

export default CreateBlogPost;
