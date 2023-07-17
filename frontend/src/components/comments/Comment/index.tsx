import UserProfileLink from '@/components/UserProfileLink';
import { Comment as CommentModel } from '@/models/comment';
import { formatRelativeDate } from '@/utils/utils';

interface CommentLayoutProps {
  comment: CommentModel;
}

const CommentLayout = ({ comment }: CommentLayoutProps) => {
  return (
    <div>
      <div className="mb-2">{comment.text}</div>
      <div className="d-flex gap-2 align-items-center">
        <UserProfileLink user={comment.author} />
        {formatRelativeDate(comment.createdAt)}
        {comment.updatedAt > comment.createdAt && <span>(Edited)</span>}
      </div>
    </div>
  );
};

interface CommentProps {
  comment: CommentModel;
}

const Comment = ({ comment }: CommentProps) => {
  return (
    <div>
      <hr />
      <CommentLayout comment={comment} />
    </div>
  );
};

export default Comment;
