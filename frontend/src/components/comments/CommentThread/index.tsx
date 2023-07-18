import { Comment as CommentModel } from '@/models/comment';
import { useState } from 'react';
import * as BlogApi from '@/network/api/blog';
import Comment from '../Comment';
import { Button, Spinner } from 'react-bootstrap';

interface CommentThreadProps {
  comment: CommentModel;
  onCommentUpdated: (updatedComment: CommentModel) => void;
  onCommentDeleted: (comment: CommentModel) => void;
}

const CommentThread = ({
  comment,
  onCommentUpdated,
  onCommentDeleted,
}: CommentThreadProps) => {
  const [replies, setReplies] = useState<CommentModel[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesLoadingIsError, setRepliesLoadingIsError] = useState(false);

  const [repliesPaginationEnd, setRepliesPaginationEnd] = useState<boolean>();

  const [localReplies, setLocalReplies] = useState<CommentModel[]>([]);

  const loadNextRepliesPage = async () => {
    const continueAfterId = replies[replies.length - 1]?._id;
    try {
      setRepliesLoading(true);
      setRepliesLoadingIsError(false);
      const response = await BlogApi.getRepliesForComment(
        comment._id,
        continueAfterId
      );
      setReplies([...replies, ...response.comments]);
      setRepliesPaginationEnd(response.endOfPaginationReached);
      setLocalReplies([]);
    } catch (error) {
      console.error(error);
      setRepliesLoadingIsError(true);
    } finally {
      setRepliesLoading(false);
    }
  };

  const handleReplyCreated = (reply: CommentModel) => {
    setLocalReplies([...localReplies, reply]);
  };

  const handleRemoteReplyUpdate = (updatedReply: CommentModel) => {
    const update = replies.map((existingReply) =>
      existingReply._id === updatedReply._id ? updatedReply : existingReply
    );
    setReplies(update);
  };

  const handleRemoteReplyDeleted = (deletedReply: CommentModel) => {
    const update = replies.filter((reply) => reply._id !== deletedReply._id);
    setReplies(update);
  };

  const handleLocalReplyUpdated = (updatedReply: CommentModel) => {
    const update = localReplies.map((existingReply) =>
      existingReply._id === updatedReply._id ? updatedReply : existingReply
    );
    setLocalReplies(update);
  };

  const handleLocalReplyDeleted = (deletedReply: CommentModel) => {
    const update = localReplies.filter(
      (reply) => reply._id !== deletedReply._id
    );
    setLocalReplies(update);
  };

  const showLoadRepliesButton =
    !!comment.repliesCount && !repliesLoading && !repliesPaginationEnd;

  return (
    <div>
      <Comment
        comment={comment}
        onReplyCreated={handleReplyCreated}
        onCommentUpdated={onCommentUpdated}
        onCommentDeleted={onCommentDeleted}
      />
      <Replies
        replies={replies}
        onReplyCreated={handleReplyCreated}
        onReplyUpdated={handleRemoteReplyUpdate}
        onReplyDeleted={handleRemoteReplyDeleted}
      />
      <div className="mt-2 text-center">
        {repliesLoading && <Spinner animation="border" />}
        {repliesLoadingIsError && <p>Replies could not be loaded</p>}
        {showLoadRepliesButton && (
          <Button variant="outline-primary" onClick={loadNextRepliesPage}>
            {repliesPaginationEnd === undefined
              ? `Show ${comment.repliesCount} ${
                  comment.repliesCount === 1 ? 'reply' : 'replies'
                }`
              : 'Show more replies'}
          </Button>
        )}
      </div>
      <Replies
        replies={localReplies}
        onReplyCreated={handleReplyCreated}
        onReplyUpdated={handleLocalReplyUpdated}
        onReplyDeleted={handleLocalReplyDeleted}
      />
    </div>
  );
};

export default CommentThread;

interface RepliesProps {
  replies: CommentModel[];
  onReplyCreated: (reply: CommentModel) => void;
  onReplyUpdated: (updatedReply: CommentModel) => void;
  onReplyDeleted: (reply: CommentModel) => void;
}

function Replies({
  replies,
  onReplyCreated,
  onReplyUpdated,
  onReplyDeleted,
}: RepliesProps) {
  return (
    <div className="ms-5">
      {replies.map((reply) => (
        <Comment
          key={reply._id}
          comment={reply}
          onReplyCreated={onReplyCreated}
          onCommentUpdated={onReplyUpdated}
          onCommentDeleted={onReplyDeleted}
        />
      ))}
    </div>
  );
}
