import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import {
  getProductComment,
  getProductCommentReply,
  addComment,
} from "../../features/slices/commentSlice";
import { MessageCircle, Reply, Send, X, Upload, User } from "lucide-react";
import { toast } from "react-toastify";

export default function CommentModal() {
  const dispatch = useDispatch();
  const selector = useSelector((state) => state?.productComment);
  let { commentProduct, error, loading } = selector || {};
  let { commentList = [], total = 0 } = commentProduct || {};

  let { id } = useParams();

  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState({});
  const [repliesData, setRepliesData] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    if (id) {
      dispatch(getProductComment({ id, pagination }))
        .then((result) => {
          if (getProductComment.fulfilled.match(result)) {
            console.log("Comments loaded successfully");
          } else {
            const { message, code } = result.payload || {};
            console.error(`Comment failed [${code}]: ${message}`);
          }
        })
        .catch((error) => {
          console.error("Unexpected error:", error);
        });
    }
  }, [pagination, id]);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const formData = new FormData();
    formData.append("content", newComment);
    formData.append("product", id);
    formData.append("parent", ""); // Empty parent for main comments

    // Add selected images if any
    if (selectedImages.length > 0) {
      selectedImages.forEach((image) => {
        formData.append("files", image);
      });
    }

    dispatch(addComment(formData))
      .then((result) => {
        if (addComment.fulfilled.match(result)) {
          toast.success("Comment Added");
          // Refresh the comments list
          dispatch(getProductComment({ id, pagination }));
          setNewComment("");
          setSelectedImages([]);
        } else {
          const { message, code } = result.payload || {};
          console.error(`Comment failed [${code}]: ${message}`);
          toast.error("Failed to add comment");
        }
      })
      .catch((error) => {
        console.error("Unexpected error:", error);
        toast.error("Unexpected error occurred");
      });
  };

  const handleSubmitReply = (parentId) => {
    if (!replyContent.trim()) return;

    const formData = new FormData();
    formData.append("content", replyContent);
    formData.append("parent", parentId);
    formData.append("product", id);

    dispatch(addComment(formData))
      .then((result) => {
        if (addComment.fulfilled.match(result)) {
          toast.success("Reply Added");
          // Refresh the main comments list
          dispatch(getProductComment({ id, pagination }));
          // Refresh the specific reply thread
          dispatch(
            getProductCommentReply({
              parentId: parentId,
              pageNo: 1,
              size: 10,
            })
          ).then((replyResult) => {
            if (getProductCommentReply.fulfilled.match(replyResult)) {
              setRepliesData((prev) => ({
                ...prev,
                [parentId]: replyResult.payload.data,
              }));
            }
          });
          setReplyContent("");
          setReplyTo(null);
        } else {
          const { message, code } = result.payload || {};
          console.error(`Reply failed [${code}]: ${message}`);
          toast.error("Failed to add reply");
        }
      })
      .catch((error) => {
        console.error("Unexpected error:", error);
        toast.error("Unexpected error occurred");
      });
  };

  const loadMoreReplies = (commentId) => {
    const currentReplies = repliesData[commentId];
    const nextPage = currentReplies
      ? Math.floor(currentReplies.commentList.length / 10) + 1
      : 1;

    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));

    dispatch(
      getProductCommentReply({
        parentId: commentId,
        pageNo: nextPage,
        size: 10,
      })
    )
      .then((result) => {
        if (getProductCommentReply.fulfilled.match(result)) {
          const newReplies = result.payload.data;

          setRepliesData((prev) => ({
            ...prev,
            [commentId]: {
              ...newReplies,
              commentList: [
                ...(prev[commentId]?.commentList || []),
                ...newReplies.commentList,
              ],
            },
          }));
        } else {
          console.error("Failed to load replies:", result.payload?.message);
        }
      })
      .catch((error) => {
        console.error("Unexpected error loading replies:", error);
      })
      .finally(() => {
        setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
      });
  };

  const toggleReplies = (commentId) => {
    const isCurrentlyShown = showReplies[commentId];

    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));

    if (!isCurrentlyShown && !repliesData[commentId]) {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));

      dispatch(
        getProductCommentReply({
          parentId: commentId,
          pageNo: 1,
          size: 10,
        })
      )
        .then((result) => {
          if (getProductCommentReply.fulfilled.match(result)) {
            setRepliesData((prev) => ({
              ...prev,
              [commentId]: result.payload.data,
            }));
          } else {
            console.error("Failed to load replies:", result.payload?.message);
          }
        })
        .catch((error) => {
          console.error("Error loading replies:", error);
        })
        .finally(() => {
          setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
        });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log("Selected files:", files);
    setSelectedImages(files);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      {/* Rest of the component stays the same */}
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Comments ({total})</h2>
        </div>
      </div>

      {/* Comment Input */}
      <div className="p-4 border-b bg-gray-50">
        <div className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none  "
            rows="3"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-1 cursor-pointer text-gray-600 hover:text-blue-600">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Add Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {selectedImages.length > 0 && (
                <span className="text-sm text-blue-600">
                  {selectedImages.length} image(s) selected
                </span>
              )}
            </div>

            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Comment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto max-h-96">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : commentList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {commentList.map((comment) => (
              <div
                key={comment._id}
                className="border-b border-gray-100 pb-4 last:border-b-0"
              >
                {/* Main Comment */}
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-800">{comment.content}</p>

                      {/* Comment Images */}
                      {comment.photos && comment.photos.length > 0 && (
                        <div className="mt-2 flex space-x-2 overflow-x-auto">
                          {comment.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Comment image ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                              onClick={() => window.open(photo, "_blank")}
                            />
                          ))}
                        </div>
                      )}

                      {/* Associated Products */}
                      {comment.associatedProducts &&
                        comment.associatedProducts.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-medium text-gray-700">
                              Associated Products:
                            </p>
                            {comment.associatedProducts.map((product) => (
                              <div
                                key={product._id}
                                className="text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                {product.title} - $
                                {product.fixedPrice || product.originPrice}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{formatDate(comment.createdAt)}</span>
                      <button
                        onClick={() =>
                          setReplyTo(
                            replyTo === comment._id ? null : comment._id
                          )
                        }
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Reply</span>
                      </button>
                      {comment.totalReplies > 0 && (
                        <button
                          onClick={() => toggleReplies(comment._id)}
                          className="text-blue-600 hover:underline"
                        >
                          {showReplies[comment._id] ? "Hide" : "Show"}{" "}
                          {comment.totalReplies} repl
                          {comment.totalReplies === 1 ? "y" : "ies"}
                        </button>
                      )}
                    </div>

                    {/* Reply Input */}
                    {replyTo === comment._id && (
                      <div className="mt-3 ml-4">
                        <div className="flex space-x-2">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none  "
                            rows="2"
                          />
                          <button
                            onClick={() => handleSubmitReply(comment._id)}
                            disabled={!replyContent.trim()}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {showReplies[comment._id] && (
                      <div className="mt-3 ml-4 space-y-3">
                        {loadingReplies[comment._id] ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-sm text-gray-500">
                              Loading replies...
                            </span>
                          </div>
                        ) : (
                          <>
                            {/* Show replies from the API response */}
                            {comment.replies && comment.replies.map((reply) => (
                              <div key={reply._id} className="flex space-x-2">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    {reply.author.profileImage ? (
                                      <img
                                        src={reply.author.profileImage}
                                        alt={reply.author.userName}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <User className="w-4 h-4 text-green-600" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="bg-white border rounded-lg p-2">
                                    <div className="text-xs font-medium text-gray-700 mb-1">
                                      {reply.author.userName}
                                    </div>
                                    <p className="text-sm text-gray-800">
                                      {reply.content}
                                    </p>

                                    {/* Reply Images */}
                                    {reply.photos && reply.photos.length > 0 && (
                                      <div className="mt-2 flex space-x-2 overflow-x-auto">
                                        {reply.photos.map((photo, index) => (
                                          <img
                                            key={index}
                                            src={photo}
                                            alt={`Reply image ${index + 1}`}
                                            className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                                            onClick={() => window.open(photo, "_blank")}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {formatDate(reply.createdAt)}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Show additional loaded replies */}
                            {repliesData[comment._id]?.commentList?.map(
                              (reply) => (
                                <div key={reply._id} className="flex space-x-2">
                                  <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                      {reply.author.profileImage ? (
                                        <img
                                          src={reply.author.profileImage}
                                          alt={reply.author.userName}
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        <User className="w-4 h-4 text-green-600" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-white border rounded-lg p-2">
                                      <div className="text-xs font-medium text-gray-700 mb-1">
                                        {reply.author.userName}
                                      </div>
                                      <p className="text-sm text-gray-800">
                                        {reply.content}
                                      </p>

                                      {/* Reply Images */}
                                      {reply.photos && reply.photos.length > 0 && (
                                        <div className="mt-2 flex space-x-2 overflow-x-auto">
                                          {reply.photos.map((photo, index) => (
                                            <img
                                              key={index}
                                              src={photo}
                                              alt={`Reply image ${index + 1}`}
                                              className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                                              onClick={() => window.open(photo, "_blank")}
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {formatDate(reply.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}

                            {/* Load more replies button */}
                            {repliesData[comment._id] &&
                              repliesData[comment._id].total >
                                repliesData[comment._id].commentList?.length && (
                                <button
                                  className="text-sm text-blue-600 hover:underline ml-10"
                                  onClick={() => loadMoreReplies(comment._id)}
                                >
                                  Load more replies...
                                </button>
                              )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {total > commentList.length && (
        <div className="p-4 border-t">
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, pageNo: prev.pageNo + 1 }))
            }
            className="w-full py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Load More Comments
          </button>
        </div>
      )}
    </div>
  );
}
