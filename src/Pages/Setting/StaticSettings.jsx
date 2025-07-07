import React, { useState, useEffect } from "react";
import {
  Bold, Italic, Underline, List, ListOrdered,
  Link, Code, Quote, Heading, Type, Eye, EyeOff
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateAppSetting } from "../../features/slices/settingSlice";
import { toast } from "react-toastify";
import axiosClient from '../../api/axiosClient';
import authAxiosClient from "../../api/authAxiosClient";

// ------------------- AdvancedRichTextEditor -------------------
const AdvancedRichTextEditor = ({ value, onChange }) => {
  const [content, setContent] = useState(value || "");
  const [isPreview, setIsPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setContent(value || "");
  }, [value]);

  const handleContentChange = (newContent) => {
    setContent(newContent);
    onChange(newContent);
  };

  const insertTag = (openTag, closeTag = "", placeholder = "") => {
    const textarea = document.getElementById("editor-textarea");
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const insertText = selectedText || placeholder;
      const newText =
        content.substring(0, start) +
        openTag +
        insertText +
        closeTag +
        content.substring(end);
      handleContentChange(newText);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + openTag.length + insertText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const formatText = (format) => {
    const formats = {
      bold: ["<strong>", "</strong>", "bold text"],
      italic: ["<em>", "</em>", "italic text"],
      underline: ["<u>", "</u>", "underlined text"],
      h1: ["<h1>", "</h1>", "Heading 1"],
      h2: ["<h2>", "</h2>", "Heading 2"],
      h3: ["<h3>", "</h3>", "Heading 3"],
      p: ["<p>", "</p>", "Paragraph"],
      ul: ["<ul>\n  <li>", "</li>\n</ul>", "List item"],
      ol: ["<ol>\n  <li>", "</li>\n</ol>", "List item"],
      blockquote: ["<blockquote>", "</blockquote>", "Quote text"],
      code: ["<code>", "</code>", "code"],
      link: ['<a href="https://example.com">', "</a>", "Link text"],
    };
    const [openTag, closeTag, placeholder] = formats[format] || [];
    insertTag(openTag, closeTag, placeholder);
  };

  const ToolbarButton = ({ onClick, icon: Icon, title, variant }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        variant === "active"
          ? "bg-blue-300 text-blue-700"
          : "hover:bg-gray-300 text-gray-700"
      }`}
    >
      <Icon size={16} />
    </button>
  );

  const TextButton = ({ onClick, text, title }) => (
    <button
      onClick={onClick}
      title={title}
      className="px-3 py-2 text-sm font-medium rounded hover:bg-gray-300 text-gray-700 transition-colors"
    >
      {text}
    </button>
  );

  return (
    <div className={`border rounded-lg bg-white ${isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : ""}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-3">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 mr-2">
            <ToolbarButton onClick={() => formatText("bold")} icon={Bold} title="Bold (Ctrl+B)" />
            <ToolbarButton onClick={() => formatText("italic")} icon={Italic} title="Italic (Ctrl+I)" />
            <ToolbarButton onClick={() => formatText("underline")} icon={Underline} title="Underline (Ctrl+U)" />
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Headings */}
          <div className="flex items-center gap-1 mr-2">
            <TextButton onClick={() => formatText("h1")} text="H1" title="Heading 1" />
            <TextButton onClick={() => formatText("h2")} text="H2" title="Heading 2" />
            <TextButton onClick={() => formatText("h3")} text="H3" title="Heading 3" />
            <TextButton onClick={() => formatText("p")} text="P" title="Paragraph" />
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists and Elements */}
          <div className="flex items-center gap-1 mr-2">
            <ToolbarButton onClick={() => formatText("ul")} icon={List} title="Bullet List" />
            <ToolbarButton onClick={() => formatText("ol")} icon={ListOrdered} title="Numbered List" />
            <ToolbarButton onClick={() => formatText("blockquote")} icon={Quote} title="Quote" />
            <ToolbarButton onClick={() => formatText("code")} icon={Code} title="Code" />
            <ToolbarButton onClick={() => formatText("link")} icon={Link} title="Link" />
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* View Controls */}
          <div className="flex items-center gap-1 ml-auto">
            <ToolbarButton
              onClick={() => setIsPreview(!isPreview)}
              icon={isPreview ? EyeOff : Eye}
              title={isPreview ? "Edit Mode" : "Preview Mode"}
              variant={isPreview ? "active" : "default"}
            />
            <ToolbarButton
              onClick={() => setIsFullscreen(!isFullscreen)}
              icon={Type}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              variant={isFullscreen ? "active" : "default"}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${isFullscreen ? "h-full" : "min-h-[300px]"} flex flex-col`}>
        {isPreview ? (
          <div className="flex-1 p-4 overflow-auto">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        ) : (
          <textarea
            id="editor-textarea"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="flex-1 p-4 border-0 resize-none focus:outline-none font-mono text-sm"
            placeholder="Start typing here..."
            spellCheck={false}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t px-4 py-2 text-xs text-gray-500 flex justify-between">
        <span>Characters: {content.length}</span>
        <span>Mode: {isPreview ? "Preview" : "Edit"}</span>
      </div>
    </div>
  );
};

// ------------------- StaticSettings Component -------------------
export default function StaticSettings() {
  const dispatch = useDispatch();
  const staticSettings = useSelector((state) => state.setting.termAndPolicy || {});
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

  // Handle video URL input (optional, if you want to allow direct URL update)
  const handleVideoUrlInput = (e) => {
    setVideoPreview(e.target.value);
    setVideoFile(null);
  };

  // Placeholder for update handler (to be implemented with backend)
  const handleVideoUpdate = async () => {
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }
    setVideoLoading(true);
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      // If backend expects a key, add it:
      // formData.append('key', '11videoXYZ');
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

  useEffect(() => {
    const obj = {};
    Object.values(staticSettings).forEach((item) => {
      obj[item._id] = item.value;
    });
    setEditData(obj);
  }, [staticSettings]);

  const handleChange = (id, value) => {
    setEditData((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdate = async (item) => {
    const { _id, key, name } = item;
    const updatedValue = editData[_id];

    setIsLoading(true);
    try {
      const payload = { id: _id, name, key, value: updatedValue };

      const result = await dispatch(updateAppSetting(payload));
      if (updateAppSetting.fulfilled.match(result)) {
        toast.success("Setting updated");
      } else {
        toast.error(result.payload?.message || "Update failed");
      }
    } catch (err) {
      toast.error("Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = (id) => editData[id] !== staticSettings[id]?.value;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      Video Section
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
            {/* Optional: Allow direct URL input */}
            {/* <input type="text" placeholder="Paste video URL" value={videoPreview} onChange={handleVideoUrlInput} className="border p-2 rounded" /> */}
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
      Existing settings UI
      <div className="space-y-8">
        {Object.values(staticSettings).map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow-sm border">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(item.createdAt).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <AdvancedRichTextEditor
                value={editData[item._id] || ""}
                onChange={(val) => handleChange(item._id, val)}
              />
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => handleUpdate(item)}
                  disabled={isLoading || !hasChanges(item._id)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${hasChanges(item._id) && !isLoading ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                >
                  {isLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
