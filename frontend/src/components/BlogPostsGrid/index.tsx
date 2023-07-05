import { BlogPost } from '@/models/blog-post';
import { Col, Row } from 'react-bootstrap';
import BlogPostEntry from '../BlogPostEntry';
import styles from '@/styles/BlogPostsGrid.module.css';

interface BlogPostsGridProps {
  posts: BlogPost[];
}

const BlogPostsGrid = ({ posts }: BlogPostsGridProps) => {
  return (
    <Row xs={1} sm={2} lg={3} className="g-4">
      {posts.map((post) => (
        <Col key={post._id}>
          <BlogPostEntry post={post} className={styles.entry} />
        </Col>
      ))}
    </Row>
  );
};

export default BlogPostsGrid;
