'use client';

import { useUser } from '@clerk/nextjs';
import { HiOutlinePhotograph } from 'react-icons/hi';
import { useRef, useState, useEffect } from 'react';
import { app } from '../firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL,} from 'firebase/storage';
import { Button } from "@/components/ui/button"
import {useAppUser} from "@/hooks/useAppUser.js";
import {createPost} from "@/lib/actions/post.js";
import {useApiToast} from "@/lib/utils.js";
import {getCommunityById} from "@/lib/actions/community.js";

export default function PostInput({communityId, organizationId, placeholder, parentId, onPostCreated = null}) {
  // console.log('parentId', parentId);
  const { user, isSignedIn, isLoaded } = useUser();
  const {appUser} = useAppUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showResponseToast, showErrorToast } = useApiToast();
  const [ community, setCommunity ] = useState(null);

  //Image
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageFileUplaoding, setImageFileUploading] = useState(false);
  const [text, setText] = useState('');
  const imagePickRef = useRef(null);
  const textareaRef = useRef(null);

  //Image
  const addImageToPost = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (selectedFile) {
      uploadImageToStorage();
    }
  }, [selectedFile]);

  useEffect(() => {
    const fetchCommunity = async () => {
      if (!communityId) return;

      try {
        const response = await getCommunityById(communityId);

        if (response.success) {
          setCommunity(response.community);
          // console.log(response.community);
        } else {
          console.log('Failed to fetch community data');
        }
      } catch (err) {
        console.error('Error fetching community:', err);
      }
    };

    fetchCommunity();
  }, [communityId]);

  const uploadImageToStorage = async () => {
    setImageFileUploading(true);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + '-' + selectedFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.log(error);
        setImageFileUploading(false);
        setSelectedFile(null);
        setImageFileUrl(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleSubmit = async () => {
    if (!text.trim() || imageFileUplaoding || isSubmitting) {
      return;
    }

    if (!communityId && !organizationId) {
      showErrorToast('Organization ID or Community ID is required');
      return;
    }

    setIsSubmitting(true);

    const response = await createPost({
      userId: appUser.id,
      communityId: communityId,
      parentId: parentId,
      text,
      profileImg: appUser.avatar,
      image: imageFileUrl,
      organizationId: organizationId,
    })

    // console.log(response)

    if(!response.success) {
      setIsSubmitting(false);
      return showErrorToast(response.message);
    }

    showResponseToast(response);
    setIsSubmitting(false);
    setText('');
    setSelectedFile(null);
    setImageFileUrl(null);

    // Call the callback if provided (useful for comment handling)
    if (onPostCreated && typeof onPostCreated === 'function') {
      onPostCreated();
    }
  };

  // Handle Command+Enter to submit post
  const handleKeyDown = (e) => {
    // Check for Command+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault(); // Prevent default new line behavior
      handleSubmit();
    }
  };

  if (!isSignedIn || !isLoaded) {
    return (
      <div className="w-full"></div>
    );
  }

  return (
    <div className='flex border-b border-gray-200 p-3 space-x-3 w-full'>
      <img
        src={user.imageUrl}
        alt='user-img'
        className='h-11 w-11 rounded-full cursor-pointer hover:brightness-95 object-cover flex-shrink-0'
      />
      <div className='w-full divide-y divide-gray-200'>
        <textarea
          ref={textareaRef}
          className='w-full border-none outline-none tracking-wide min-h-[50px] text-gray-700'
          placeholder={placeholder || (parentId ? 'Write a comment...' : 'What\'s on your mind?')}
          rows={parentId ? '2' : '3'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        ></textarea>
        {selectedFile && (
          <img
            onClick={() => {
              setSelectedFile(null);
              setImageFileUrl(null);
            }}
            src={imageFileUrl}
            alt='selected-img'
            className={`w-full max-h-[250px] object-cover cursor-pointer ${
              imageFileUplaoding ? 'animate-pulse' : ''
            }`}
          />
        )}
        <div className='flex items-center justify-between pt-2.5'>
          <div className='flex items-center'>
            <HiOutlinePhotograph className='h-10 w-10 p-2 text-sky-500 hover:bg-sky-100 rounded-full cursor-pointer'
                                 onClick={() => imagePickRef.current.click()}
            />
            <span className="text-xs text-gray-500 ml-2">Tip: Press ⌘+Enter to post</span>
          </div>
          <input
            type='file'
            ref={imagePickRef}
            accept='image/*'
            hidden
            onChange={addImageToPost}
          />
          <Button
            onClick={handleSubmit}
            disabled={text.trim() === '' || imageFileUplaoding || isSubmitting}
            size={parentId ? 'sm' : 'default'}
          >
            {isSubmitting ? (parentId ? 'Commenting...' : 'Posting...') : (parentId ? 'Comment' : 'Post')}
          </Button>
        </div>
      </div>
    </div>
  );
}