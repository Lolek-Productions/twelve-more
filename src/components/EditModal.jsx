'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getPostByIdWithComments, updatePost } from "@/lib/actions/post.js";
import { useMainContext } from "@/components/MainContextProvider.jsx";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function EditModal() {
  const {
    showingPostEditModal,
    setShowingPostEditModal,
    selectedPostId,
    setSelectedPostId
  } = useMainContext();

  const [post, setPost] = useState(null);
  const [postLoading, setPostLoading] = useState(false);
  const [editText, setEditText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!selectedPostId) {
      return;
    }

    const fetchPost = async () => {
      if (selectedPostId !== '') {
        setPostLoading(true);
        const postResponse = await getPostByIdWithComments(selectedPostId);

        if (postResponse.success) {
          setPost(postResponse.post);
          setEditText(postResponse.post.text);
          setPostLoading(false);
        } else {
          setPostLoading(false);
          console.log('Failed to fetch post from EditModal');
        }
      }
    };
    fetchPost();
  }, [selectedPostId]);

  // Function to refresh main page data
  const refreshMainPage = () => {
    // Invalidate and refetch main posts query
    if (post?.id) {
      queryClient.invalidateQueries(['post', post.id]);
    }

    // If you have organization-specific queries
    if (post?.organization?.id) {
      queryClient.invalidateQueries(['infiniteOrganizationFeed', post.organization.id]);
    }
    // If you have community-specific queries
    if (post?.community?.id) {
      queryClient.invalidateQueries(['infiniteCommunityFeed', post.community.id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || !editText.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updateResponse = await updatePost({
        id: post.id,
        text: editText,
        organizationId: post.organization.id,
        communityId: post.community?.id
      });

      if (updateResponse.success) {
        handleClose();
        refreshMainPage();
      } else {
        console.error('Failed to update post:', updateResponse.error);
      }
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowingPostEditModal(false);
    setSelectedPostId(null);
    setEditText('');
  };

  return (
    <Dialog open={showingPostEditModal} onOpenChange={(open) => {
      if (!open) handleClose();
      setShowingPostEditModal(open);
    }}>
      <DialogContent className="sm:max-w-lg w-[90%] max-h-[90vh] h-[60vh] flex flex-col">
        <DialogHeader className="flex flex-col space-y-1.5 text-left">
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto p-4">
          {postLoading ? (
            <div className="flex items-center justify-center py-4 h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Post Info */}
              <div className="flex items-center space-x-1 relative mb-4">
                <div className="h-11 w-11 rounded-full mr-4 overflow-hidden flex-shrink-0">
                  <img
                    src={
                      post
                        ? post?.profileImg
                        : 'https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg'
                    }
                    alt="user-img"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold sm:text-[16px] text-[15px] truncate">
                    {`${post?.user?.firstName} ${post?.user?.lastName}`}
                  </h4>
                  <h4 className="font-bold text-xs">
                    {post?.organization?.name} {post?.community?.name && `- ${post?.community?.name}`}
                  </h4>
                </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col h-[calc(100%-60px)]">
                <div className="flex-1 mb-4">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Edit your post..."
                    className="w-full min-h-[120px] resize-none h-full"
                    required
                  />
                </div>
                <DialogFooter className="mt-auto">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !editText.trim()}
                    variant="default"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}