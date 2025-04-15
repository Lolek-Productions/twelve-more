'use client';

import { useUser } from '@clerk/nextjs';
import { HiOutlinePhotograph } from 'react-icons/hi';
import { useRef, useState, useEffect } from 'react';
import { app } from '../firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL,} from 'firebase/storage';
import { Button } from "@/components/ui/button"
import {createPost} from "@/lib/actions/post.js";
import {useApiToast} from "@/lib/utils.js";
import {getCommunityById} from "@/lib/actions/community.js";
import {useMainContext} from "@/components/MainContextProvider.jsx";

export default function PostInput({
                                    communityId,
                                    organizationId,
                                    placeholder,
                                    parentId,
                                    onPostCreated = null,
                                    refreshMainPage = null,
                                    autoFocus = false  // Added autoFocus prop with default value
                                  }) {

  const { user, isSignedIn, isLoaded } = useUser();
  const { appUser } = useMainContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showResponseToast, showErrorToast } = useApiToast();
  const [ community, setCommunity ] = useState(null);
  const [draftKey, setDraftKey] = useState('');

  //Image
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageFileUplaoding, setImageFileUploading] = useState(false);
  const [text, setText] = useState('');
  const imagePickRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus) {
      // Short timeout to ensure DOM is ready and any animations have completed
      const timer = setTimeout(() => {
        // Check if textareaRef.current exists inside the callback
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const autoResizeTextarea = (element, maxHeight = 200) => {
    // Reset height to auto to get the correct scrollHeight
    element.style.height = 'auto';

    // Set the height to the scrollHeight (content height)
    element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;

    // If content exceeds maxHeight, enable scrolling
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  useEffect(() => {
    if (textareaRef.current) {
      // Initial resize
      autoResizeTextarea(textareaRef.current, 200);

      // Apply resize after content is inserted programmatically too
      if (text) {
        autoResizeTextarea(textareaRef.current, 200);
      }
    }
  }, [text, textareaRef.current]);

  useEffect(() => {
    // Create a unique key for this specific post input based on context
    const key = `draft_${communityId || ''}_${organizationId || ''}_${parentId || 'main'}`;
    setDraftKey(key);

    // Load any saved draft on component mount
    const savedDraft = localStorage.getItem(key);
    if (savedDraft) {
      setText(savedDraft);
    }

    // Clean up function to handle component unmount or page refresh
    return () => {
      // Optionally clear the draft when component unmounts
      // If you want drafts to persist across sessions, comment this out
      // localStorage.removeItem(key);
    };
  }, [communityId, organizationId, parentId]);

  // Add this function to save drafts periodically
  const saveDraft = (content) => {
    if (!draftKey) return;

    if (content.trim() === '') {
      // If content is empty, remove the draft
      localStorage.removeItem(draftKey);
    } else {
      // Save non-empty content
      localStorage.setItem(draftKey, content);
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Auto-resize if you're using that functionality
    if (typeof autoResizeTextarea === 'function') {
      autoResizeTextarea(e.target, 500);
    }

    // Save draft after a short delay (debounce)
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(() => {
      saveDraft(newText);
    }, 500); // Save after 500ms of inactivity
  };

// Clear the draft after successful submission
  const clearDraft = () => {
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
  };

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
    clearDraft();


    // Call the refreshMainPage function if provided
    if (refreshMainPage && typeof refreshMainPage === 'function') {
      refreshMainPage();
    }

    // Call the callback if provided (useful for comment handling)
    if (onPostCreated && typeof onPostCreated === 'function') {
      onPostCreated();
    }

    // Focus the textarea again after posting
    if (autoFocus && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
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
          rows="2" // Start with 1 row
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          style={{
            resize: 'none',
            overflowY: 'hidden', // Hide scrollbar initially
          }}
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