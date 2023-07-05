import FormInputField from '@/components/FormInputField';
import LoadingButton from '@/components/LoadingButton';
import MarkdownEditor from '@/components/MarkdownEditor';
import * as BlogApi from '@/network/api/blog';
import { generateSlug } from '@/utils/utils';
import { useRouter } from 'next/router';
import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

interface CreatePostFormData {
  slug: string;
  title: string;
  summary: string;
  body: string;
  featuredImage: FileList;
}

const CreateBlogPost = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormData>();

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

  return (
    <div>
      <h1>Create a post</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormInputField
          label="Post Title"
          register={register('title', { required: 'Required' })}
          placeholder="Post Title"
          maxLength={100}
          error={errors.title}
          onBlur={generateSlugFromTitle}
        />
        <FormInputField
          label="Post Slug"
          register={register('slug', { required: 'Required' })}
          placeholder="Post Slug"
          maxLength={100}
          error={errors.slug}
        />
        <FormInputField
          label="Post Summary"
          register={register('summary', { required: 'Required' })}
          placeholder="Post Summary"
          maxLength={300}
          as="textarea"
          error={errors.summary}
        />
        <FormInputField
          label="Post Image"
          register={register('featuredImage', { required: 'Required' })}
          type="file"
          accept="image/png,image/png"
          error={errors.featuredImage}
        />
        <MarkdownEditor
          label="Post Body"
          register={register('body', { required: 'Required' })}
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
