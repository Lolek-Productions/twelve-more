import Post from './Post';

export default function Feed({ data }) {
  // Ensure `data` is always an array to prevent errors
  const posts = Array.isArray(data) ? data : [];

  return (
    <div>
      {posts.length > 0 ? (
        posts.map((post) =>
          post && post._id ? <Post key={post._id} post={post} /> : null
        )
      ) : (
        <div className={'p-5'}>Create a post above!</div> // Gracefully handle empty posts
      )}
    </div>
  );
}
