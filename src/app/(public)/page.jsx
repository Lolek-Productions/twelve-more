'use client'
import { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { TAG_LINE } from "@/lib/constants.js";

export default function Landing() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Redirect if user is logged in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/home');
    }
  }, [isLoaded, isSignedIn, router]);

  // Audio player controls
  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSliderChange = (e) => {
    const newTime = e.target.value;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  // Format time for display (mm:ss)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  // If authentication is still loading, you could show a loading state
  if (!isLoaded) {
    return <div className="max-w-4xl mx-auto px-12 py-10 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-10 px-12 py-10 text-center bg-white rounded-lg">
      <div className="text-center">
        <Image
          src="/logo.png"
          alt="12More"
          className={'mx-auto'}
          width={80}
          height={80}
          priority
        />
      </div>
      <h1 className="mt-3 text-[50px] font-bold text-gray-800 leading-normal">
        12More
      </h1>
      <div className="text-2xl text-gray-600">
        {TAG_LINE}
      </div>

      {/* Welcome Message */}
      <div className="mt-6 mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Welcome to TwelveMore!</h2>
        <p className="text-gray-700 mb-4">
          Inspired by Jesus's method of forming his first community, our app is built on the
          <span className="font-bold"> Call → Teach → Send </span>
          model.
        </p>
        <p className="text-gray-700 mb-4">
          This approach begins by <span className="font-bold">welcoming</span> individuals into a supportive
          community where they feel they belong and matter, just as Jesus called his first disciples.
          Once this foundation of belonging is established, the community <span className="font-bold">teaches</span> members
          how to love God and their neighbor through the core tenets of the faith, exemplified by Mary's nurturing role.
          Finally, those who have embraced this love are <span className="font-bold">sent</span> out to share their joy
          and form new communities, multiplying the impact of faith and connection.
        </p>
        <p className="text-gray-700">
          This continuous cycle of welcome, growth in love, and mission is the heart of TwelveMore,
          aiming to help parishes and small groups thrive.
        </p>
      </div>

      {/* Audio Player */}
      <div className="my-8 p-6 bg-blue-50 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Listen to an Introduction to Call - Teach - Send</h3>
        <audio
          ref={audioRef}
          src="/assets/Call-Teach-Send-Overview.mp3"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />

        {/* Audio Controls */}
        <div className="flex flex-col items-center">
          {/* Large Play/Pause Button */}
          <Button
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 bg-blue-600 hover:bg-blue-700"
          >
            {isPlaying ?
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> :
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            }
          </Button>

          {/* Progress Bar and Time Display */}
          <div className="w-full flex items-center">
            <span className="text-sm mr-3">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSliderChange}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm ml-3">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        Sign in and find your community
      </div>
      <Button asChild className="mt-4 text-lg py-6 px-8">
        <Link href="/sign-up">Get Started</Link>
      </Button>
    </div>
  );
}