'use client';

import { HiOutlinePhotograph } from 'react-icons/hi';
import { useRef, useState, useEffect } from 'react';
import { app } from '../firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL,} from 'firebase/storage';
import { Button } from "@/components/ui/button"
import {useApiToast} from "@/lib/utils.js";
import {createPost} from "@/lib/actions/post.js";
import {useMainContext} from "@/components/MainContextProvider.jsx";

export default function CommentInput({post, onCommentCreated = null}) {
  const { appUser } = useMainContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showResponseToast, showErrorToast } = useApiToast();

  //Image
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageFileUplaoding, setImageFileUploading] = useState(false);
  const [text, setText] = useState('');
  const imagePickRef = useRef(null);

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
    setIsSubmitting(true);

    if (!post) {
      showErrorToast('Post to comment on is required');
      setIsSubmitting(false);
      return;
    }

    const response = await createPost({
      userId: appUser.id,
      communityId: post.community.id,
      text,
      profileImg: appUser.avatar,
      image: imageFileUrl,
      organizationId: post.organization.id,
      parentId: post.id,
    })

    if(!response.success) {
      setIsSubmitting(false);
      return showErrorToast({message: response.message || 'Error creating post'});
    }

    showResponseToast(response);
    setIsSubmitting(false);
    setText('');
    setSelectedFile(null);
    setImageFileUrl(null);


    // Call the callback if provided (useful for comment handling)
    if (onCommentCreated && typeof onCommentCreated === 'function') {
      onCommentCreated(response.post);
    }
  };

  // if (!isLoaded) {
  //   return (
  //     <div className="w-full">Loading</div>
  //   );
  // }

  return (
    <div className='flex border-b border-gray-200 p-3 space-x-3 w-full'>
      <img
        src={appUser.avatar}
        alt='user-img'
        className='h-11 w-11 rounded-full cursor-pointer hover:brightness-95 object-cover flex-shrink-0'
      />
      <div className='w-full divide-y divide-gray-200'>
        <textarea
          className='w-full border-none outline-none tracking-wide min-h-[50px] text-gray-700'
          placeholder={'Comment'}
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
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
          </div>
          <input
            type='file'
            ref={imagePickRef}
            accept='image/*'
            hidden
            onChange={addImageToPost}
          />

          {/*<button*/}
          {/*  className="bg-blue-500 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:bg-blue-600 disabled:opacity-50 transition-colors"*/}
          {/*  disabled={input.trim() === '' || postLoading || submitting}*/}
          {/*  onClick={sendComment}*/}
          {/*>*/}
          {/*  {submitting ? "Sending..." : "Reply"}*/}
          {/*</button>*/}

          <Button
            className="bg-blue-500 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
            onClick={handleSubmit}
            disabled={text.trim() === '' || imageFileUplaoding || isSubmitting}
          >
            {isSubmitting ? 'Commenting...' : 'Comment'}
          </Button>
        </div>
      </div>
    </div>
  );
}