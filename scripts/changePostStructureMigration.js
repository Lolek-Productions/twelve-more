'use server'

import { connect } from '../src/lib/mongodb/mongoose.js';
import Post from '../src/lib/models/post.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config({ path: '/Users/joshmccarty/Code-2022M1/twelve-more/.env.local' });

// Running this script:
// node scripts/changePostStructureMigration.js

/**
 * Migration script to convert embedded comments into posts with parentId references
 * Run this script only once after deploying the updated Post model
 */

export async function runMigration() {
  console.log('Starting migration: Converting comments to posts with parentId');

  try {
    // Connect to MongoDB
    await connect();
    console.log('Connected to MongoDB');

    // Define the old and new schemas
    const OldPostSchema = new mongoose.Schema({
      text: String,
      image: String,
      audio: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
      organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
      profileImg: String,
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      prayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      comments: [{
        comment: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        profileImg: String,
        createdAt: { type: Date, default: Date.now },
      }],
    }, { timestamps: true });

    const NewPostSchema = new mongoose.Schema({
      text: String,
      parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
      image: String,
      audio: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
      organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
      profileImg: String,
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      prayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    }, { timestamps: true });

    // Create models from the schemas
    const OldPost = mongoose.models.OldPost || mongoose.model('OldPost', OldPostSchema, 'posts');
    const NewPost = mongoose.models.NewPost || mongoose.model('NewPost', NewPostSchema, 'posts');

    // Get all posts with at least one comment
    const postsWithComments = await OldPost.find({
      'comments.0': { $exists: true }
    }).lean();

    console.log(`Found ${postsWithComments.length} posts with comments to migrate`);

    let totalCommentsMigrated = 0;
    let processedPosts = 0;
    const results = {
      successful: [],
      failed: []
    };

    // Process each post
    for (const post of postsWithComments) {
      processedPosts++;
      console.log(`Processing post ${processedPosts}/${postsWithComments.length} (ID: ${post._id})`);

      try {
        const comments = post.comments || [];
        console.log(`Found ${comments.length} comments to migrate for this post`);

        // Create new posts for each comment
        for (const comment of comments) {
          try {
            const newComment = new NewPost({
              text: comment.comment, // Map 'comment' field to 'text'
              parentId: post._id, // Reference to parent post
              user: comment.user,
              organization: post.organization, // Inherit from parent post
              community: post.community, // Inherit from parent post
              profileImg: comment.profileImg,
              createdAt: comment.createdAt || new Date(),
              updatedAt: comment.createdAt || new Date()
            });

            await newComment.save();
            totalCommentsMigrated++;
            results.successful.push(newComment._id);

            if (totalCommentsMigrated % 50 === 0) {
              console.log(`Migrated ${totalCommentsMigrated} comments so far...`);
            }
          } catch (commentError) {
            console.error(`Error migrating comment: ${commentError.message}`);
            results.failed.push({
              postId: post._id.toString(),
              error: commentError.message
            });
          }
        }

        // Remove comments array from the post
        await NewPost.updateOne(
          { _id: post._id },
          { $unset: { comments: 1 } }
        );
      } catch (postError) {
        console.error(`Error processing post ${post._id}: ${postError.message}`);
        results.failed.push({
          postId: post._id.toString(),
          error: postError.message
        });
      }
    }

    // Create an index on parentId for better query performance
    await NewPost.collection.createIndex({ parentId: 1 });
    console.log('Created index on parentId field');

    console.log(`Migration complete!\n- Processed ${processedPosts} posts\n- Migrated ${totalCommentsMigrated} comments\n- Created ${results.successful.length} comment-posts\n- Failed: ${results.failed.length}`);

    return {
      success: true,
      message: 'Migration completed successfully',
      summary: {
        postsProcessed: processedPosts,
        commentsMigrated: totalCommentsMigrated,
        successful: results.successful.length,
        failed: results.failed.length
      },
      failedItems: results.failed
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message}`,
      error: error.message
    };
  }
}

runMigration().catch(console.error);