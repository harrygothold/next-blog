import useAuthenticatedUser from '@/hooks/useAuthenticatedUser';
import { User } from '@/models/user';
import * as UsersApi from '@/network/api/user';
import * as BlogApi from '@/network/api/blog';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { Col, Form, Row, Spinner } from 'react-bootstrap';
import profilePicPlaceholder from '@/assets/images/profile-pic-placeholder.png';
import styles from '@/styles/UserProfilePage.module.css';
import { formatDate } from '@/utils/utils';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import FormInputField from '@/components/FormInputField';
import useSWR from 'swr';
import LoadingButton from '@/components/LoadingButton';
import BlogPostsGrid from '@/components/BlogPostsGrid';
import { NotFoundError } from '@/network/http-errors';
import PaginationBar from '@/components/PaginationBar';

export const getServerSideProps: GetServerSideProps<
  UserProfilePageProps
> = async ({ params }) => {
  try {
    const username = params?.username?.toString();
    if (!username) throw Error('username missing');

    const user = await UsersApi.getUserByUsername(username);

    return {
      props: {
        user,
      },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { notFound: true };
    } else {
      throw error;
    }
  }
};

interface UserInfoSectionProps {
  user: User;
}

const UserInfoSection = ({
  user: { username, displayName, profilePicUrl, about, createdAt },
}: UserInfoSectionProps) => {
  return (
    <Row>
      <Col sm="auto">
        <Image
          src={profilePicUrl || profilePicPlaceholder}
          width={200}
          height={200}
          alt={`Profile picture user: ${username}`}
          priority
          className={`rounded ${styles.profilePic}`}
        />
      </Col>
      <Col className="mt-2 mt-sm-0">
        <h1>{displayName}</h1>
        <div>
          <strong>Username: </strong>
          {username}
        </div>
        <div>
          <strong>User since: </strong>
          {formatDate(createdAt)}
        </div>
        <div className="pre-line">
          <strong>About me:</strong>
          <br />
          {about || 'This user has not shared any info yet'}
        </div>
      </Col>
    </Row>
  );
};

const validationSchema = yup.object({
  displayName: yup.string(),
  about: yup.string(),
  profilePic: yup.mixed<FileList>(),
});

type UpdateUserProfileFormData = yup.InferType<typeof validationSchema>;

interface UpdateUserProfileSectionProps {
  onUserUpdated: (updatedUser: User) => void;
}

const UpdateUserProfileSection = ({
  onUserUpdated,
}: UpdateUserProfileSectionProps) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdateUserProfileFormData>();

  const onSubmit = async ({
    displayName,
    about,
    profilePic,
  }: UpdateUserProfileFormData) => {
    if (!displayName && !about && (!profilePic || profilePic.length === 0))
      return;

    try {
      const updatedUser = await UsersApi.updateUser({
        displayName,
        about,
        profilePic: profilePic?.item(0) || undefined,
      });
      onUserUpdated(updatedUser);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <div>
      <h2>Update Profile</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormInputField
          register={register('displayName')}
          label="Display Name"
          placeholder="Display Name"
          maxLength={20}
        />
        <FormInputField
          register={register('about')}
          label="About me"
          placeholder="Tell us a few things about you"
          maxLength={160}
          as="textarea"
        />
        <FormInputField
          register={register('profilePic')}
          type="file"
          accept="image/png,image/jpeg"
          label="Profile picture"
        />
        <LoadingButton type="submit" isLoading={isSubmitting}>
          Update profile
        </LoadingButton>
      </Form>
    </div>
  );
};

interface UserBlogPostsSectionProps {
  user: User;
}

const UserBlogPostsSection = ({ user }: UserBlogPostsSectionProps) => {
  const [page, setPage] = useState(1);
  const {
    data,
    isLoading: blogPostsLoading,
    error: blogPostsLoadingError,
  } = useSWR([user._id, page, 'user_posts'], ([userId, page]) =>
    BlogApi.getBlogPostsByUser(userId, page)
  );

  const blogPosts = data?.blogPosts || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div>
      <h2>Blog Posts</h2>
      {blogPosts.length > 0 && <BlogPostsGrid posts={blogPosts} />}
      <div className="d-flex flex-column align-items-center">
        {blogPosts.length > 0 && (
          <PaginationBar
            currentPage={page}
            pageCount={totalPages}
            onPageItemClicked={(page: number) => setPage(page)}
            className="mt-4"
          />
        )}
        {blogPostsLoading && <Spinner animation="border" />}
        {blogPostsLoadingError && <p>Blog posts could not be loaded</p>}
        {!blogPostsLoading &&
          !blogPostsLoadingError &&
          blogPosts.length === 0 && <p>This user has no posts</p>}
      </div>
    </div>
  );
};

interface ProfilePageProps {
  user: User;
}

const UserProfile = ({ user }: ProfilePageProps) => {
  const { user: loggedInUser, mutateUser: mutateLoggedInUser } =
    useAuthenticatedUser();
  const [profileUser, setProfileUser] = useState(user);

  const profileUserIsLoggedInUser =
    (loggedInUser && loggedInUser._id === profileUser._id) || false;

  const handleUserUpdated = (updatedUser: User) => {
    mutateLoggedInUser(updatedUser);
    setProfileUser(updatedUser);
  };

  return (
    <>
      <Head>
        <title>{`${profileUser.username} - Flow Blog`}</title>
      </Head>
      <div>
        <UserInfoSection user={profileUser} />
        {profileUserIsLoggedInUser && (
          <>
            <hr />
            <UpdateUserProfileSection onUserUpdated={handleUserUpdated} />
          </>
        )}
        <hr />
        <UserBlogPostsSection user={profileUser} />
      </div>
    </>
  );
};

interface UserProfilePageProps {
  user: User;
}

export default function UserProfilePage({ user }: UserProfilePageProps) {
  return <UserProfile user={user} key={user._id} />;
}
