"use client"

import React from 'react';
import Link from 'next/link';
import SafeMicrolink from './SafeMicrolink';

const PostText = ({ post, clickableText }) => {
  // Extract URLs using a regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Helper function to extract URLs
  const extractUrls = (text) => {
    if (!text) return [];
    const matches = text.match(urlRegex);
    return matches || [];
  };

  // Helper function to linkify text
  const linkifyText = (text) => {
    if (!text) return '';

    // Replace URLs with anchor tags
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  };

  // Extract URLs regardless of clickableText
  const urls = post?.text ? extractUrls(post.text) : [];

  // If not clickable text, still extract URLs but use linkifyText for display
  if (!clickableText) {
    return (
      <div>
        <p className="text-gray-800 text-sm mt-1.5 mb-2 whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
           style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}
           dangerouslySetInnerHTML={{ __html: linkifyText(post?.text) || 'No text available' }}>
        </p>

        {/* Render Microlink previews for non-clickable text too */}
        {urls.length > 0 && urls.map((url, index) => (
          <div
            key={`microlink-${index}`}
            className="mt-2 mb-3"
          >
            <SafeMicrolink url={url} />
          </div>
        ))}
      </div>
    );
  }

  // If no text, render as normal clickable text without microlink
  if (!post?.text) {
    return (
      <Link href={`/posts/${post?.id}`} className="block w-full">
        <p className="text-gray-800 text-sm mt-1.5 mb-2 whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
           style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          {'No text available'}
        </p>
      </Link>
    );
  }

  // If no links detected in text, render clickable text without microlink
  if (!post.text.includes('http')) {
    return (
      <Link href={`/posts/${post?.id}`} className="block w-full">
        <p className="text-gray-800 text-sm mt-1.5 mb-2 whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
           style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          {post.text}
        </p>
      </Link>
    );
  }

  // For clickable text with links, split text into parts
  const parts = post.text.split(urlRegex);

  return (
    <div>
      <p className="text-gray-800 text-sm mt-1.5 mb-2 whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
         style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {parts.map((part, index) => {
          // Check if this part is a URL
          if (part.match(urlRegex)) {
            // This is a URL - make it a clickable link that stops propagation
            return (
              <a
                key={index}
                href={part}
                className="text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
              >
                {part}
              </a>
            );
          } else {
            // This is regular text - make it clickable to the post
            return (
              <Link
                key={index}
                href={`/posts/${post?.id}`}
                className="inline"
              >
                {part}
              </Link>
            );
          }
        })}
      </p>

      {/* Render Microlink components for each URL found in the text */}
      {urls.length > 0 && urls.map((url, index) => (
        <div
          key={`microlink-${index}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-2 mb-3"
        >
          <SafeMicrolink url={url} />
        </div>
      ))}
    </div>
  );
};

export default PostText;