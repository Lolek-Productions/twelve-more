"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllPosts } from "@/lib/actions/post"; // Adjust path to where you saved getPosts
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import {PostTable} from "@/app/developer/posts/post-table.jsx";


export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPosts() {
      try {
        // You can add selectedOrganizationId here if needed
        const postList = await getAllPosts({
          limit: 10,
          // selectedOrganizationId: "some-org-id" // Uncomment and set if needed
        });
        setPosts(postList || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch posts"
        });
      }
    }
    fetchPosts();
  }, []);

  const breadcrumbItems = [
    { href: "/developer", label: "Developer" },
    { label: "Posts" },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Recent Posts</h3>
          <p className="text-sm text-muted-foreground">
            View and manage recent posts across the platform.
          </p>
        </div>
      </div>
      <div className="mt-3">
        <PostTable data={posts} />
      </div>
    </div>
  );
}