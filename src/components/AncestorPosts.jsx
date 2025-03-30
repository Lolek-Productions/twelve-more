import Post from "./Post.jsx";

export default function AncestorPosts({ posts = [] }) {
  // const sortedComments = comments.sort(
  //   (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  // );

  return (
    <>
      {posts.map((post) => (
        <Post post={post} key={post.id} clickableText={true} isAncestor={true} />
      ))}
    </>
  );
}
