"use client"

import React, { useRef, useState } from 'react'
import { FaCircleStop, FaMicrophone } from 'react-icons/fa6'
import { app } from '../../../firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL,} from 'firebase/storage';

export default function Recorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedURL, setRecordedURL] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [audioFileUplaoding, setAudioFileUploading] = useState(false);

  const mediaStream = useRef(null)
  const mediaRecorder = useRef(null)
  const chunks = useRef([])

  const startRecording = async () => {
    console.log('startRecording')
    setIsRecording(true)
    try {
      setSeconds(0)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStream.current = stream
      mediaRecorder.current = new MediaRecorder(stream)
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data)
        }
      }
      const timer = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)

      mediaRecorder.current.onstop = async () => {
        console.log('onStop')
        const recordedBlob = new Blob(chunks.current, { type: 'audio/mp3' })

        await uploadAudioFileToStorage(recordedBlob);

        const url = URL.createObjectURL(recordedBlob)
        setRecordedURL(url)

        chunks.current = []
        clearTimeout(timer)
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
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return (
    <div className='w-full h-screen flex flex-col items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 gap-4'>

      <h1 className='text-white text-[60px] font-black'>
        Recorder
      </h1>

      <h2 className='text-[100px] text-white bg-black p-4 rounded-lg mx-4'>
        {formatTime(seconds)}
      </h2>

      {isRecording ? <button onClick={stopRecording} className='flex items-center justify-center text-[60px] bg-red-500 rounded-full p-4 text-white w-[100px] h-[100px]'>
        <FaCircleStop />
      </button> :
        <button onClick={startRecording} className='flex items-center justify-center text-[60px] bg-blue-500 rounded-full p-4 text-white w-[100px] h-[100px]'>
          <FaMicrophone />
        </button>
      }

      {recordedURL && <audio controls src={recordedURL} />}
    </div>
  )
}
