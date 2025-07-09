import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { fetchThreadById } from '../../features/slices/threadSlice'
import Button from '../../Component/Atoms/Button/Button'
import { FaHeart, FaRegHeart, FaComment, FaShare, FaLock, FaImage, FaTimes } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import authAxiosClient from '../../api/authAxiosClient'
import InputField from '../../Component/Atoms/InputFields/Inputfield'
import ProductsModal from './Modal'

export default function ThreadDetail() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const thread = useSelector(state => state?.thread?.currentThread)
    const [selectedImage, setSelectedImage] = useState(0)
    const [comments, setComments] = useState([])
    const [commentPage, setCommentPage] = useState(1)
    const [totalComments, setTotalComments] = useState(0)
    const [loadingComments, setLoadingComments] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [selectedProducts, setSelectedProducts] = useState([])
    const [commentImages, setCommentImages] = useState([])
    const [previewImages, setPreviewImages] = useState([])
    const [viewingReplies, setViewingReplies] = useState(null)
    const [replies, setReplies] = useState({})
    const [replyPages, setReplyPages] = useState({})
    const [loadingReplies, setLoadingReplies] = useState({})
    const [isProductsModalOpen, setIsProductsModalOpen] = useState(false)

    console.log('123455',replies)

    useEffect(() => {
        if (id) {
            dispatch(fetchThreadById(id))
            fetchComments(1)
        }
    }, [id, dispatch])

    const fetchComments = async (page) => {
        try {
            setLoadingComments(true)
            const response = await authAxiosClient.get(`/thread/getThreadComments/${id}?pageNo=${page}&size=10`)
            if (response.data.status) {
                if (page === 1) {
                    setComments(response.data.data.commentList)
                } else {
                    setComments(prev => [...prev, ...response.data.data.commentList])
                }
                setTotalComments(response.data.data.total)
                setCommentPage(page)
            }
        } catch (error) {
            console.error('Error fetching comments:', error)
        } finally {
            setLoadingComments(false)
        }
    }

    const fetchReplies = async (commentId, page = 1) => {
        try {
            setLoadingReplies(prev => ({ ...prev, [commentId]: true }))
            const response = await authAxiosClient.get(`/thread/getCommentByParentId/${commentId}?pageNo=${page}&size=10`)
            
            if (response.data.status) {
                const { pageNo, size, total, data } = response.data.data
                
                setReplyPages(prev => ({
                    ...prev,
                    [commentId]: { pageNo, size, total }
                }))

                // Ensure data is an array and handle the nested structure
                const replyData = Array.isArray(data) ? data : []
                
                setReplies(prev => ({
                    ...prev,
                    [commentId]: page === 1 ? replyData : [...(prev[commentId] || []), ...replyData]
                }))
            }
        } catch (error) {
            console.error('Error fetching replies:', error)
            // Initialize empty array on error
            setReplies(prev => ({
                ...prev,
                [commentId]: prev[commentId] || []
            }))
        } finally {
            setLoadingReplies(prev => ({ ...prev, [commentId]: false }))
        }
    }

    const handleLike = async () => {
        try {
            await authAxiosClient.post('/user/threadlike', { threadId: id })
            dispatch(fetchThreadById(id))
        } catch (error) {
            console.error('Error liking thread:', error)
        }
    }

    const handleCloseThread = async () => {
        try {
            await authAxiosClient.post(`/thread/closeThread/${id}`)
            dispatch(fetchThreadById(id))
        } catch (error) {
            console.error('Error toggling thread status:', error)
        }
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        setCommentImages(files)
        
        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file))
        setPreviewImages(previews)
    }

    const handleAddComment = async () => {
        try {
            const formData = new FormData()
            formData.append('content', newComment)
            formData.append('thread', id)
            selectedProducts.forEach(productId => {
                formData.append('associatedProducts', productId)
            })
            
            // Append each image file
            commentImages.forEach(image => {
                formData.append('files', image)
            })

            await authAxiosClient.post('/thread/addComment', formData)
            setNewComment('')
            setSelectedProducts([])
            setCommentImages([])
            setPreviewImages([])
            fetchComments(1)
            dispatch(fetchThreadById(id))
        } catch (error) {
            console.error('Error adding comment:', error)
        }
    }

    const handleAddReply = async (parentId, content) => {
        try {
            const formData = new FormData()
            formData.append('content', content)
            formData.append('thread', id)
            formData.append('parent', parentId)

            const response = await authAxiosClient.post('/thread/addComment', formData)
            if (response.data.status) {
                // Refresh replies for this comment
                fetchReplies(parentId)
                // Refresh thread to update total comments count
                dispatch(fetchThreadById(id))
            }
        } catch (error) {
            console.error('Error adding reply:', error)
        }
    }

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            previewImages.forEach(url => URL.revokeObjectURL(url))
        }
    }, [previewImages])

    if (!thread) return <div>Loading...</div>

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg">
                {/* Header Section */}
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <img 
                                src={thread.userId?.profileImage} 
                                alt={thread.userId?.userName}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    {thread.userId?.userName}
                                    {thread.userId?.isLive && (
                                        <span className="w-2 h-2 bg-green-500 rounded-full" title="Online"/>
                                    )}
                                </h3>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    {thread.userId?.provinceId?.value}
                                    {thread.userId?.is_Id_verified && (
                                        <span className="text-blue-500">✓ ID Verified</span>
                                    )}
                                    {thread.userId?.is_Preferred_seller && (
                                        <span className="text-green-500">★ Preferred Seller</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {thread.myThread && (
                            <Button 
                                variant={thread.isClosed ? "primary" : "outline"}
                                onClick={handleCloseThread}
                                className="flex items-center gap-2"
                            >
                                <FaLock size={16} />
                                {thread.isClosed ? 'Reopen Thread' : 'Close Thread'}
                            </Button>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{thread.title}</h1>
                    <p className="text-gray-600">{thread.description}</p>
                </div>

                {/* Images Section */}
                <div className="p-6 border-b">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="aspect-w-16 aspect-h-9">
                            <img 
                                src={thread.photos[selectedImage]} 
                                alt={thread.title}
                                className="w-full h-[400px] object-cover rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2 h-[400px] overflow-y-auto">
                            {thread.photos.map((photo, index) => (
                                <img 
                                    key={index}
                                    src={photo} 
                                    alt={`${thread.title} ${index + 1}`}
                                    className={`w-full h-32 object-cover rounded cursor-pointer ${selectedImage === index ? 'ring-2 ring-blue-500' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-6 border-b">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-4">Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Category</span>
                                    <span className="font-medium">{thread.categoryId?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subcategory</span>
                                    <span className="font-medium">{thread.subCategoryName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Budget</span>
                                    <span className="font-medium">
                                        {thread.budgetFlexible ? 'Flexible' : `฿${thread.budgetRange.min.toLocaleString()} - ฿${thread.budgetRange.max.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Posted</span>
                                    <span className="font-medium">{new Date(thread.createdAt).toLocaleDateString()}</span>
                                </div>
                                {thread.isClosed && (
                                    <div className="flex justify-between text-red-500">
                                        <span>Status</span>
                                        <span className="font-medium">Closed</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {thread.tags.map((tag, index) => (
                                    <span 
                                        key={index}
                                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Engagement Section */}
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button 
                                className="flex items-center gap-2"
                                onClick={handleLike}
                            >
                                {thread.isLiked ? (
                                    <FaHeart className="text-red-500" size={24} />
                                ) : (
                                    <FaRegHeart size={24} />
                                )}
                                <span>{thread.totalLikes}</span>
                            </button>
                            <button className="flex items-center gap-2">
                                <FaComment size={24} />
                                <span>{thread.totalComments}</span>
                            </button>
                 
                        </div>
                    </div>
                </div>

                {/* Associated Products */}
                {thread.associatedProducts?.length > 0 && (
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Associated Products ({thread.totalAssociatedProducts})</h3>
                            {thread.associatedProducts.length > 2 && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsProductsModalOpen(true)}
                                >
                                    View All
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {thread.associatedProducts.slice(0, 2).map(product => (
                                <div key={product._id} className="flex gap-4 border rounded-lg p-4">
                                    <div className="w-32 h-32 flex-shrink-0">
                                        {product.productImages?.length > 0 ? (
                                            <img 
                                                src={product.productImages[0]} 
                                                alt={product.title}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="text-gray-400 text-sm">No image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{product.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                                                <div className="mt-2">
                                                    <span className="text-sm font-medium">
                                                        {product.saleType === 'fixed' ? (
                                                            `Fixed Price: ฿${product.fixedPrice?.toLocaleString()}`
                                                        ) : (
                                                            `Auction • ${product.totalBids} bids`
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 rounded text-sm ${product.isSold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {product.isSold ? 'Sold' : 'Available'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <img 
                                                src={product.seller?.profileImage} 
                                                alt={product.seller?.userName}
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <span className="text-sm">{product.seller?.userName}</span>
                                            {product.seller?.is_Verified_Seller && (
                                                <span className="text-blue-500 text-sm">✓</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products Modal */}
                <ProductsModal 
                    isOpen={isProductsModalOpen}
                    onClose={() => setIsProductsModalOpen(false)}
                    products={thread.associatedProducts || []}
                />

                {/* Comments Section */}
                <div className="p-6 border-t">
                    <h3 className="font-semibold mb-4">Comments ({totalComments})</h3>
                    
                    {/* Add Comment */}
                    {!thread.isClosed && (
                        <div className="mb-6">
                            <div className="flex flex-col gap-4">
                                <InputField
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="flex-1"
                                />
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer flex items-center gap-2 text-blue-500 hover:text-blue-600">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <FaImage size={20} />
                                        Add Images
                                    </label>
                                    <Button 
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim() && commentImages.length === 0}
                                    >
                                        Comment
                                    </Button>
                                </div>
                                {/* Image Previews */}
                                {previewImages.length > 0 && (
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {previewImages.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img 
                                                    src={preview} 
                                                    alt={`Preview ${index + 1}`} 
                                                    className="w-20 h-20 object-cover rounded"
                                                />
                                                <button
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                    onClick={() => {
                                                        const newImages = commentImages.filter((_, i) => i !== index)
                                                        const newPreviews = previewImages.filter((_, i) => i !== index)
                                                        setCommentImages(newImages)
                                                        setPreviewImages(newPreviews)
                                                        URL.revokeObjectURL(preview)
                                                    }}
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                       

                            {/* Comments List */}
                            <div className="space-y-4">
                                {comments && comments?.map(comment => (
                                    <div key={comment._id} className="border rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <img 
                                                src={comment.author?.profileImage} 
                                                alt={comment.author?.userName}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{comment.author?.userName}</span>
                                                    {comment.author?.is_Id_verified && (
                                                        <span className="text-blue-500 text-sm">✓</span>
                                                    )}
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="mt-1">{comment.content}</p>
                                                
                                                {/* Comment Images */}
                                                {comment.photos?.length > 0 && (
                                                    <div className="mt-2 flex gap-2 flex-wrap">
                                                        {comment.photos.map((photo, index) => (
                                                            <img 
                                                                key={index}
                                                                src={photo}
                                                                alt={`Comment image ${index + 1}`}
                                                                className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                                                                onClick={() => window.open(photo, '_blank')}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {/* Associated Products in Comment */}
                                                {comment.associatedProducts?.length > 0 && (
                                                    <div className="mt-2">
                                                        <span className="text-sm text-gray-500">Associated Products:</span>
                                                        <div className="mt-2 space-y-3">
                                                            {comment.associatedProducts.map(product => (
                                                                <div key={product._id} className="flex gap-3 border rounded-lg p-3">
                                                                    <div className="w-24 h-24 flex-shrink-0">
                                                                        {product.productImages?.length > 0 ? (
                                                                            <img 
                                                                                src={product.productImages[0]} 
                                                                                alt={product.title}
                                                                                className="w-full h-full object-cover rounded-lg"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                                                                <span className="text-gray-400 text-sm">No image</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-medium text-sm">{product.title}</h4>
                                                                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                                                                        <div className="mt-2 flex items-center justify-between">
                                                                            <span className="text-sm font-medium">
                                                                                {product.saleType === 'fixed' ? (
                                                                                    `฿${product.fixedPrice?.toLocaleString()}`
                                                                                ) : (
                                                                                    'Auction'
                                                                                )}
                                                                            </span>
                                                                            <span className={`px-2 py-1 rounded text-xs ${product.isSold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                                                {product.isSold ? 'Sold' : 'Available'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Replies */}
                                                {!thread.isClosed && (
                                                    <div className="mt-2">
                                                        {viewingReplies === comment._id ? (
                                                            <div className="mt-4 space-y-4">
                                                                {/* Replies List */}
                                                                {(Array.isArray(replies[comment._id]) ? replies[comment._id] : [])?.map(reply => (
                                                                    <div key={reply._id} className="flex items-start gap-3 pl-8">
                                                                        <img 
                                                                            src={reply.author?.profileImage} 
                                                                            alt={reply.author?.userName}
                                                                            className="w-6 h-6 rounded-full"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-medium text-sm">{reply.author?.userName}</span>
                                                                                {reply.author?.is_Id_verified && (
                                                                                    <span className="text-blue-500 text-xs">✓</span>
                                                                                )}
                                                                                <span className="text-xs text-gray-500">
                                                                                    {new Date(reply.createdAt).toLocaleDateString()}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm mt-1">{reply.content}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                {/* Load More Replies */}
                                                                {replyPages[comment._id] && 
                                                                 replies[comment._id]?.length < replyPages[comment._id].total && (
                                                                    <div className="pl-8">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => fetchReplies(comment._id, (replyPages[comment._id].pageNo || 1) + 1)}
                                                                            disabled={loadingReplies[comment._id]}
                                                                            className="w-full"
                                                                        >
                                                                            {loadingReplies[comment._id] ? 'Loading...' : 'Load More Replies'}
                                                                        </Button>
                                                                    </div>
                                                                )}

                                                                {/* Reply Input */}
                                                                <div className="pl-8">
                                                                    <InputField
                                                                        type="text"
                                                                        placeholder="Add a reply..."
                                                                        onKeyPress={(e) => {
                                                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                                                handleAddReply(comment._id, e.target.value)
                                                                                e.target.value = ''
                                                                            }
                                                                        }}
                                                                        className="text-sm"
                                                                    />
                                                                </div>

                                                                {/* Hide Replies Button */}
                                                                <div className="pl-8">
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setViewingReplies(null)
                                                                            // Optionally clear replies for this comment to fetch fresh next time
                                                                            setReplies(prev => {
                                                                                const newReplies = { ...prev }
                                                                                delete newReplies[comment._id]
                                                                                return newReplies
                                                                            })
                                                                        }}
                                                                    >
                                                                        Hide Replies
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <button 
                                                                    className="text-blue-500 text-sm hover:underline"
                                                                    onClick={() => {
                                                                        setViewingReplies(comment._id)
                                                                        fetchReplies(comment._id)
                                                                    }}
                                                                >
                                                                    Reply
                                                                </button>
                                                                {comment.totalReplies > 0 && (
                                                                    <button 
                                                                        className="text-gray-500 text-sm hover:underline flex items-center gap-1"
                                                                        onClick={() => {
                                                                            setViewingReplies(comment._id)
                                                                            fetchReplies(comment._id)
                                                                        }}
                                                                    >
                                                                        {/* <FaComment size={14} /> */}
                                                                        <span>
                                                                            {comment.totalReplies} {comment.totalReplies === 1 ? 'reply' : 'replies'}
                                                                        </span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load More Comments */}
                            {comments.length < totalComments && (
                                <div className="mt-4 text-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => fetchComments(commentPage + 1)}
                                        disabled={loadingComments}
                                    >
                                        {loadingComments ? 'Loading...' : 'Load More Comments'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recommended Threads */}
                    {thread&&thread.recommendedThreads?.length > 0 && (
                        <div className="p-6 border-t">
                            <h3 className="font-semibold mb-4">Recommended Threads</h3>
                            <div className="flex overflow-x-auto gap-4 pb-4 flex-wrap -mx-2 px-2 snap-x">
                                {thread.recommendedThreads.map(rec => (
                                    <Link 
                                        key={rec._id} 
                                        to={`/thread/${rec._id}`}
                                        className="flex-shrink-0 w-[300px] border rounded-lg p-4 hover:bg-gray-50 transition-colors snap-start"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="relative">
                                                <img 
                                                    src={rec.user?.profileImage} 
                                                    alt={rec.user?.userName}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                {rec.user?.isLive && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium text-sm">{rec.user?.userName}</span>
                                                    {rec.user?.is_Id_verified && (
                                                        <span className="text-blue-500 text-sm">✓</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(rec.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm line-clamp-2">{rec.title}</h4>
                                            <p className="text-sm text-gray-600 line-clamp-2">{rec.description}</p>
                                            {rec.budgetRange && (
                                                <div className="text-sm text-gray-900">
                                                    Budget: ฿{rec.budgetRange.min.toLocaleString()} - ฿{rec.budgetRange.max.toLocaleString()}
                                                </div>
                                            )}
                                            {rec.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {rec.tags.slice(0, 2).map((tag, idx) => (
                                                        <span 
                                                            key={idx} 
                                                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {rec.tags.length > 2 && (
                                                        <span className="text-xs text-gray-500">
                                                            +{rec.tags.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                                                <div className="flex items-center gap-1">
                                                    <FaHeart className={rec.isLiked ? "text-red-500" : "text-gray-400"} size={14} />
                                                    <span>{rec.totalLikes}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaComment className="text-gray-400" size={14} />
                                                    <span>{rec.totalComments}</span>
                                                </div>
                                                {rec.productCount > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-400">📦</span>
                                                        <span>{rec.productCount}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
