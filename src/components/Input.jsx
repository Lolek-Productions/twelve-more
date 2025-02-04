'use client';

import { useUser } from '@clerk/nextjs';
import { HiOutlinePhotograph, HiOutlineMicrophone, HiX, HiOutlineStop } from 'react-icons/hi';
import { useRef, useState, useEffect } from 'react';
import { app } from '../firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL,} from 'firebase/storage';
import { Button } from "@/components/ui/button"


export default function Input() {
  const { user, isSignedIn, isLoaded } = useUser();

  //Image
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageFileUplaoding, setImageFileUploading] = useState(false);
  const [text, setText] = useState('');
  const [postLoading, setPostLoading] = useState(false);
  const imagePickRef = useRef(null);

  //Audio
  const [isRecording, setIsRecording] = useState(false)
  const [recordedURL, setRecordedURL] = useState('')
  const [audioFileUplaoding, setAudioFileUploading] = useState(false);
  const mediaStream = useRef(null)
  const mediaRecorder = useRef(null)
  const chunks = useRef([])

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

  //Audio
  const startRecording = async () => {
    console.log('startRecording')
    setIsRecording(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStream.current = stream
      mediaRecorder.current = new MediaRecorder(stream)
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data)
        }
      }

      mediaRecorder.current.onstop = async () => {
        console.log('onStop')
        const recordedBlob = new Blob(chunks.current, { type: 'audio/mp3' })

        await uploadAudioFileToStorage(recordedBlob);

        const url = URL.createObjectURL(recordedBlob)
        setRecordedURL(url)

        chunks.current = []
      }

      mediaRecorder.current.start()

    } catch (error) {
      console.log(error);
    }
  }

  const uploadAudioFileToStorage = async (recordedBlob) => {
    setAudioFileUploading(true);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + '.mp3';
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, recordedBlob);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.log(error);
        setAudioFileUploading(false);
        setRecordedURL('');
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('File available at', downloadURL);
        setRecordedURL(downloadURL);
        setAudioFileUploading(false);
      }
    );
  };

  const stopRecording = () => {
    console.log('stopRecording')
    setIsRecording(false)
    if (mediaRecorder.current) {
      mediaRecorder.current.stop()
      mediaStream.current.getTracks().forEach(track => track.stop())
    }
  }

  const handleSubmit = async () => {
    setPostLoading(true);
    const response = await fetch('/api/post/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMongoId: user.publicMetadata.userMongoId,
        name: user.fullName,
        text,
        profileImg: user.imageUrl,
        image: imageFileUrl,
        audio: recordedURL,
      }),
    });
    setPostLoading(false);
    setText('');
    setSelectedFile(null);
    setImageFileUrl(null);
    setRecordedURL(null);
    location.reload();
  };

  if (!isSignedIn || !isLoaded) {
    return null;
  }

  return (
    <div className='flex border-b border-gray-200 p-3 space-x-3 w-full'>
      <img
        src={user.imageUrl}
        alt='user-img'
        className='h-11 w-11 rounded-full cursor-pointer hover:brightness-95 object-cover'
      />
      <div className='w-full divide-y divide-gray-200'>
        <textarea
          className='w-full border-none outline-none tracking-wide min-h-[50px] text-gray-700 '
          placeholder="What's happening"
          rows='2'
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
        {recordedURL &&
          <div className="w-full py-5">
            <audio controls src={recordedURL} />
          </div>
        }
        <div className='flex items-center justify-between pt-2.5'>
          <div className='flex items-center'>
            <HiOutlinePhotograph className='h-10 w-10 p-2 text-sky-500 hover:bg-sky-100 rounded-full cursor-pointer'
              onClick={() => imagePickRef.current.click()}
            />
            {isRecording ? <HiOutlineStop onClick={stopRecording} className='h-10 w-10 p-2 text-red-400 hover:bg-red-100 rounded-full cursor-pointer' />
              : <HiOutlineMicrophone onClick={startRecording} className='h-10 w-10 p-2 text-red-400 hover:bg-red-100 rounded-full cursor-pointer' />
            }
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
            disabled={text.trim() === '' || postLoading || imageFileUplaoding}
          >Post</Button>
        </div>
      </div>
    </div>
  );
}
