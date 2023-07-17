import { Comment as CommentModel } from '@/models/comment';
import { useCallback, useEffect, useState } from 'react';
import * as BlogApi from '@/network/api/blog';
import CreateCommentBox from '../CreateCommentBox';
import Comment from '../Comment';
import { Button, Spinner } from 'react-bootstrap';

interface BlogCommentsSectionProps {
  blogPostId: string;
}

const CommentSection = ({ blogPostId }: BlogCommentsSectionProps) => {
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoadingIsError, setCommentsLoadingIsError] = useState(false);

  const [commentsPaginationEnd, setCommentsPaginationEnd] = useState<boolean>();

  const loadNextCommentsPage = useCallback(
    async (continueAfterId?: string) => {
      try {
        setCommentsLoading(true);
        setCommentsLoadingIsError(false);
        const response = await BlogApi.getCommentsForBlogPost(
          blogPostId,
          continueAfterId
        );

        if (!continueAfterId) {
          // first comments
          setComments(response.comments);
        } else {
          setComments((existingComments) => [
            ...existingComments,
            ...response.comments,
          ]);
        }
        setCommentsPaginationEnd(response.endOfPaginationReached);
      } catch (error) {
        console.error(error);
        setCommentsLoadingIsError(true);
      } finally {
        setCommentsLoading(false);
      }
    },
    [blogPostId]
  );

  useEffect(() => {
    loadNextCommentsPage();
  }, [loadNextCommentsPage]);

  const handleCommentCreated = (newComment: CommentModel) => {
    setComments([newComment, ...comments]);
  };

  return (
    <div>
      <p className="h5">Comments</p>
      <CreateCommentBox
        blogPostId={blogPostId}
        title="Write a comment"
        onCommentCreated={handleCommentCreated}
      />
      {comments.map((comment) => (
        <Comment comment={comment} key={comment._id} />
      ))}
      <div className="mt-2 text-center">
        {commentsPaginationEnd && comments.length === 0 && (
          <p>No one has a posted a comment yet. Be the first!</p>
        )}
        {commentsLoading && <Spinner animation="border" />}
        {commentsLoadingIsError && <p>Comments could not be loaded.</p>}
        {!commentsLoading && !commentsPaginationEnd && (
          <Button
            variant="outline-primary"
            onClick={() =>
              loadNextCommentsPage(comments[comments.length - 1]?._id)
            }
          >
            Show more comments
          </Button>
        )}
      </div>
    </div>
  );
};

const BlogCommentsSection = ({ blogPostId }: BlogCommentsSectionProps) => {
  return <CommentSection blogPostId={blogPostId} key={blogPostId} />;
};

export default BlogCommentsSection;
