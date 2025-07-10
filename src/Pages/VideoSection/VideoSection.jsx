import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosClient from '../../api/axiosClient';
import authAxiosClient from "../../api/authAxiosClient";

export default function VideoSection() {
  // Video state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);

  // Fetch current video URL
  useEffect(() => {
    const fetchVideo = async () => {
      setVideoLoading(true);
      try {
        const res = await axiosClient.get('/appsetting/getVideo');
        setVideoUrl(res.data?.value || res.data?.data?.value || '');
        setVideoPreview(res.data?.value || res.data?.data?.value || '');
      } catch (err) {
        setVideoUrl('');
        setVideoPreview('');
      } finally {
        setVideoLoading(false);
      }
    };
    fetchVideo();
  }, []);

  // Handle video file select
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Only allow mp4, webm, ogg
    if (!['video/mp4', 'video/webm', 'video/ogg'].includes(file.type)) {
      toast.error('Only MP4, WebM, or OGG videos allowed');
      return;
    }
    // Check duration (async)
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(url);
      if (video.duration > 30) {
        toast.error('Video must be 30 seconds or less');
        setVideoFile(null);
        setVideoPreview(videoUrl);
      } else {
        setVideoFile(file);
        setVideoPreview(url);
      }
    };
    video.src = url;
  };

  // Handle video update
  const handleVideoUpdate = async () => {
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }
    setVideoLoading(true);
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      const res = await authAxiosClient.post('/appsetting/updateVideo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newUrl = res.data?.value || res.data?.data?.value;
      setVideoUrl(newUrl);
      setVideoPreview(newUrl);
      setVideoFile(null);
      toast.success('Video updated successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update video');
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Change Video (max 30 seconds)</h2>
        </div>
        <div className="p-6 space-y-4">
          {videoLoading ? (
            <div>Loading video...</div>
          ) : videoPreview ? (
            <video src={videoPreview} controls className="w-full max-w-md rounded" />
          ) : (
            <div className="text-gray-400">No video set</div>
          )}

          <div className="flex flex-col gap-2 max-w-md">
            <label className="font-medium">Upload new video (MP4/WebM/OGG, ≤30s):</label>
            <input type="file" accept="video/mp4,video/webm,video/ogg" onChange={handleVideoChange} />
            <button
              className="mt-2 px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:bg-gray-200 disabled:text-gray-500"
              onClick={handleVideoUpdate}
              disabled={videoLoading || (!videoFile && videoPreview === videoUrl)}
            >
              Update Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 