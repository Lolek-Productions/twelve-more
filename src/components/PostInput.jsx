'use client';

import { useUser } from '@clerk/nextjs';
import { HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMicrophone, HiOutlineStop } from 'react-icons/hi';
import { useRef, useState, useEffect } from 'react';
import { app } from '../firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL,} from 'firebase/storage';
import { Button } from "@/components/ui/button"
import {createPost} from "@/lib/actions/post.js";
import {useApiToast} from "@/lib/utils.js";
import {getCommunityById} from "@/lib/actions/community.js";
import {useMainContext} from "@/components/MainContextProvider.jsx";
import Recorder from '@/app/(main)/recorder/page';

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

  // --- Audio Recording State ---
  const [isRecording, setIsRecording] = useState(false);
  const [audioFileUploading, setAudioFileUploading] = useState(false);
  const [audioFileUrl, setAudioFileUrl] = useState(null); // Firebase download URL
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [recordingError, setRecordingError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const audioStreamRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // --- Video Recording State ---
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoFileUploading, setVideoFileUploading] = useState(false);
  const [muxUploadId, setMuxUploadId] = useState(null); // Mux upload ID
  const [muxPlaybackId, setMuxPlaybackId] = useState(null); // Mux playback ID (to be filled by webhook)
  const [videoFileUrl, setVideoFileUrl] = useState(null); // (legacy, for UI preview only)
  const [recordedVideoBlob, setRecordedVideoBlob] = useState(null);
  const [videoRecordingError, setVideoRecordingError] = useState(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoProcessing, setVideoProcessing] = useState(false); // new: show processing state
  const videoStreamRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const videoPreviewRef = useRef(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);

  // Handler for mobile video file input (iOS Safari fallback)
  function handleMobileVideoFile(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setRecordedVideoBlob(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setIsVideoRecording(false);
    }
  }

  useEffect(() => {
    // Live preview: set srcObject to stream while recording
    if (isVideoRecording && !recordedVideoBlob && videoPreviewRef.current && videoStreamRef.current) {
      videoPreviewRef.current.srcObject = videoStreamRef.current;
    } else if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  }, [isVideoRecording, recordedVideoBlob]);

  useEffect(() => {
    if (recordedVideoBlob) {
      const url = URL.createObjectURL(recordedVideoBlob);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoPreviewUrl(null);
    }
  }, [recordedVideoBlob]);

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

  // Utility to clear video state after submit
  const clearVideo = () => {
    setRecordedVideoBlob(null);
    setVideoFileUrl(null);
    setVideoUploadProgress(0);
    setVideoRecordingError(null);
    setVideoPreviewUrl(null);
    setMuxUploadId(null);
    setMuxPlaybackId(null);
    setVideoProcessing(false);
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

  // --- Audio Recording Logic ---
  const startRecording = async () => {
    if (isVideoRecording) return;
    setRecordingError(null);
    setIsRecording(true);
    setRecordedAudioBlob(null);
    setAudioFileUrl(null);
    setUploadProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      audioRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };
      recorder.start();
    } catch (error) {
      setRecordingError('Could not start recording: ' + error.message);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
      audioRecorderRef.current.stop();
    }
  };

  const uploadAudioFileToStorage = async (audioBlob) => {
    setAudioFileUploading(true);
    setUploadProgress(0);
    try {
      const storage = getStorage(app);
      const fileName = `${Date.now()}.webm`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, audioBlob);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          setRecordingError('Upload failed: ' + error.message);
          setAudioFileUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setAudioFileUrl(downloadURL);
          setAudioFileUploading(false);
          setUploadProgress(100);
        }
      );
    } catch (error) {
      setRecordingError('Upload error: ' + error.message);
      setAudioFileUploading(false);
    }
  };

  // Upload when user clicks upload after preview
  const handleAudioUpload = async () => {
    if (!recordedAudioBlob) return;
    await uploadAudioFileToStorage(recordedAudioBlob);
  };

  // --- Video Recording Logic ---
  const startVideoRecording = async () => {
    if (isRecording) return;
    setVideoRecordingError(null);
    setIsVideoRecording(true);
    setRecordedVideoBlob(null);
    setVideoFileUrl(null);
    setVideoUploadProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      videoRecorderRef.current = recorder;
      videoChunksRef.current = [];
      // Set live preview srcObject immediately
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        setRecordedVideoBlob(videoBlob);
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        // Clean up live preview
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
        setIsVideoRecording(false);
      };
      recorder.start();
    } catch (error) {
      setVideoRecordingError('Could not start video recording: ' + error.message);
      setIsVideoRecording(false);
    }
  };

  const stopVideoRecording = () => {
    if (videoRecorderRef.current && videoRecorderRef.current.state !== 'inactive') {
      videoRecorderRef.current.stop();
    }
  };

  // Upload video to Mux
  const uploadVideoToMux = async (videoBlob) => {
    setVideoFileUploading(true);
    setVideoUploadProgress(0);
    setVideoProcessing(false);
    setMuxUploadId(null);
    setMuxPlaybackId(null);
    try {
      // 1. Request Mux upload URL
      const res = await fetch('/api/mux-upload-url', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to get Mux upload URL');
      const { url, id } = await res.json();
      setMuxUploadId(id);
      // 2. Upload video blob to Mux
      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'video/webm' },
        body: videoBlob,
      });
      if (!uploadRes.ok) throw new Error('Failed to upload video to Mux');
      setVideoUploadProgress(100);
      setVideoFileUploading(false);
      setVideoProcessing(true); // Video is now processing on Mux
    } catch (error) {
      setVideoRecordingError('Mux upload error: ' + error.message);
    }
  };

  //Submit post
  const handleSubmit = async () => {
    if (!text.trim() || imageFileUplaoding || isSubmitting || audioFileUploading || videoFileUploading) {
      return;
    }

    if (!communityId && !organizationId) {
      showErrorToast('Organization ID or Community ID is required');
      return;
    }

    setIsSubmitting(true);

    // If there is a video to upload, upload it to Mux first
    let finalMuxUploadId = muxUploadId;
    if (recordedVideoBlob) {
      setVideoFileUploading(true);
      setVideoUploadProgress(0);
      setVideoProcessing(false);
      setMuxUploadId(null);
      setMuxPlaybackId(null);
      try {
        // 1. Request Mux upload URL
        const res = await fetch('/api/mux-upload-url', { method: 'POST' });
        if (!res.ok) throw new Error('Failed to get Mux upload URL');
        const { url, id } = await res.json();
        setMuxUploadId(id);
        finalMuxUploadId = id;
        // 2. Upload video blob to Mux
        const uploadRes = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'video/webm' },
          body: recordedVideoBlob,
        });
        if (!uploadRes.ok) throw new Error('Failed to upload video to Mux');
        setVideoUploadProgress(100);
        setVideoFileUploading(false);
        setVideoProcessing(true); // Video is now processing on Mux
      } catch (error) {
        setVideoRecordingError('Mux upload error: ' + error.message);
        setVideoFileUploading(false);
        setVideoProcessing(false);
        setIsSubmitting(false);
        showErrorToast('Mux upload error: ' + error.message);
        return;
      }
    }

    const response = await createPost({
      userId: appUser.id,
      communityId: communityId,
      parentId: parentId,
      text,
      profileImg: appUser.avatar,
      image: imageFileUrl,
      audio: audioFileUrl,
      video: videoFileUrl,
      muxUploadId: finalMuxUploadId,
      organizationId: organizationId,
    })

    if(!response.success) {
      setIsSubmitting(false);
      return showErrorToast(response.message);
    }

    showResponseToast(response);
    clearDraft();
    setText('');
    setImageFileUrl(null);
    setSelectedFile(null);
    setAudioFileUrl(null);
    setRecordedAudioBlob(null);
    setUploadProgress(0);
    clearVideo();
    if (refreshMainPage) {
      refreshMainPage();
    }
    setIsSubmitting(false);

    // Call the callback if provided (useful for comment handling)
    if (onPostCreated && typeof onPostCreated === 'function') {
      onPostCreated();
    }

    // Focus the textarea again after posting
    if (autoFocus && textareaRef.current) {
      // Short timeout to ensure DOM is ready and any animations have completed
      const timer = setTimeout(() => {
        // Check if textareaRef.current exists inside the callback
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  };

  // Handle Command+Enter to submit post
  const handleKeyDown = (e) => {
    // Check for Command+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    const isCommandOrCtrlPressed = e.metaKey || e.ctrlKey;
    const isEnterKeyPressed = e.key === 'Enter';

    if (isCommandOrCtrlPressed && isEnterKeyPressed) {
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
        {/* Audio preview and upload controls */}
        {recordedAudioBlob && !audioFileUrl && (
          <div className="w-full py-5 flex flex-col items-center">
            <audio controls src={URL.createObjectURL(recordedAudioBlob)} />
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleAudioUpload}
                disabled={audioFileUploading}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {audioFileUploading ? `Uploading... (${Math.round(uploadProgress)}%)` : 'Upload Audio'}
              </Button>
              <Button
                onClick={() => setRecordedAudioBlob(null)}
                className="bg-gray-300 hover:bg-gray-400"
              >
                Record Again
              </Button>
            </div>
            {uploadProgress > 0 && audioFileUploading && (
              <div className="w-full bg-gray-200 rounded h-2 mt-2">
                <div className="bg-green-500 h-2 rounded" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
            {recordingError && <div className="text-red-500 mt-2">{recordingError}</div>}
          </div>
        )}
        {audioFileUrl && (
          <div className="w-full py-5 flex flex-col items-center">
            <audio controls src={audioFileUrl} />
            <div className="text-green-600 mt-2">Audio uploaded!</div>
          </div>
        )}
        {recordingError && !isRecording && (
          <div className="text-red-500 py-2">{recordingError}</div>
        )}
        {/* Video preview and upload controls */}
        {/* Live video preview while recording */}
        {isVideoRecording && !recordedVideoBlob && (
          <div className="w-full py-5 flex flex-col items-center">
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              className="w-full max-h-[300px] rounded-lg border border-gray-200 bg-black"
              style={{ background: '#000' }}
            />
            <div className="text-blue-600 mt-2">Recording…</div>
          </div>
        )}
        {/* Recorded video preview after recording stops */}
        {!isVideoRecording && recordedVideoBlob && !videoFileUrl && (
          <div className="w-full py-5 flex flex-col items-center">
            <video controls src={videoPreviewUrl} className="w-full max-h-[300px] rounded-lg border border-gray-200" />
            <div className="flex gap-2 mt-2">
              <Button
                onClick={() => setRecordedVideoBlob(null)}
                className="bg-gray-300 hover:bg-gray-400"
              >
                Record Again
              </Button>
            </div>
            {videoUploadProgress > 0 && videoFileUploading && (
              <div className="w-full bg-gray-200 rounded h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded" style={{ width: `${videoUploadProgress}%` }} />
              </div>
            )}
            {videoRecordingError && <div className="text-red-500 mt-2">{videoRecordingError}</div>}
          </div>
        )}
        {videoProcessing && !muxPlaybackId && (
          <div className="w-full py-5 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">Video uploaded! Processing on Mux...</span>
            </div>
            <div className="text-gray-500 text-xs mt-2">It may take a minute for your video to be playable.</div>
          </div>
        )}

        {videoRecordingError && !isVideoRecording && (
          <div className="text-red-500 py-2">{videoRecordingError}</div>
        )}
        <div className='flex items-center justify-between pt-2.5'>
          <div className='flex items-center'>
            <HiOutlinePhotograph className='h-10 w-10 p-2 text-sky-500 hover:bg-sky-100 rounded-full cursor-pointer'
              onClick={() => imagePickRef.current.click()}
            />
            {/* Audio Controls */}
            {isRecording ? (
              <HiOutlineStop onClick={stopRecording} className='h-9 w-9 p-2 text-red-400 hover:bg-red-100 rounded-full cursor-pointer' />
            ) : (
              <HiOutlineMicrophone onClick={() => {
                if (isVideoRecording) return;
                startRecording();
              }} className={`h-9 w-9 p-2 ${isVideoRecording ? 'opacity-50 cursor-not-allowed' : 'text-red-400 hover:bg-red-100'} rounded-full`} />
            )}

            {/* Video Controls */}
            {/* iOS fallback: use file input for video capture */}
            {(() => {
              const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
              // const isIOS = true;
              const className = `h-9 w-9 p-1 ${isVideoRecording ? 'opacity-50 cursor-not-allowed' : 'text-purple-500 hover:bg-purple-100'} rounded-full`;
              return isIOS ? (
                <label className={`${className} outline outline-2 outline-purple-200 flex items-center justify-center`}>
                  <HiOutlineVideoCamera className="h-6 w-6" />
                  <input
                    type="file"
                    accept="video/*"
                    capture
                    style={{ display: 'none' }}
                    onChange={handleMobileVideoFile}
                  />
                </label>
              ) : (
                isVideoRecording ? (
                  <HiOutlineStop onClick={stopVideoRecording} className={className} />
                ) : (
                  <HiOutlineVideoCamera onClick={() => {
                    if (isRecording) return;
                    startVideoRecording();
                  }} className={className} />
                )
              );
            })()}
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