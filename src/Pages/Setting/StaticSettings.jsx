import React, { useState, useEffect } from "react";
import {
  Bold, Italic, Underline, List, ListOrdered,
  Link, Code, Quote, Heading, Type, Eye, EyeOff
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateAppSetting } from "../../features/slices/settingSlice";
import { toast } from "react-toastify";

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
          ? "bg-blue-100 text-blue-700"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      <Icon size={16} />
    </button>
  );

  const TextButton = ({ onClick, text, title }) => (
    <button
      onClick={onClick}
      title={title}
      className="px-3 py-2 text-sm font-medium rounded hover:bg-gray-100 text-gray-700 transition-colors"
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
      <div className="space-y-8">
        {Object.values(staticSettings).map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow-sm border">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Created:{" "}
                    {new Date(item.createdAt).toLocaleString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
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
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    hasChanges(item._id) && !isLoading
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
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
