import Post from "./Post.jsx";

export default function Comments({ comments = [] }) {
  const sortedComments = comments.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <>
      {sortedComments.map((comment) => (
        <Post post={comment} key={comment.id} clickableText={true} />
      ))}
    </>
  );
}
