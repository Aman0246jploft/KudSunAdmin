import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { fetchThreadById } from '../../features/slices/threadSlice'
import { FaHeart, FaComment, FaEye } from 'react-icons/fa'
import authAxiosClient from '../../api/authAxiosClient'
import { FaShield } from 'react-icons/fa6'

export default function ThreadDetail() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const thread = useSelector(state => state?.thread?.currentThread)
    const [selectedImage, setSelectedImage] = useState(0)
    const [comments, setComments] = useState([])
    const [totalComments, setTotalComments] = useState(0)
    const [loadingComments, setLoadingComments] = useState(false)

    useEffect(() => {
        if (id) {
            dispatch(fetchThreadById(id))
            fetchComments()
        }
    }, [id, dispatch])

    const fetchComments = async () => {
        try {
            setLoadingComments(true)
            const response = await authAxiosClient.get(`/thread/getThreadComments/${id}?pageNo=1&size=50`)
            if (response.data.status) {
                    setComments(response.data.data.commentList)
                setTotalComments(response.data.data.total)
            }
        } catch (error) {
            console.error('Error fetching comments:', error)
        } finally {
            setLoadingComments(false)
        }
    }

    if (!thread) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading thread details...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Thread Details - Admin View</h1>
                        <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${thread.isClosed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {thread.isClosed ? 'Closed Thread' : 'Active Thread'}
                            </span>
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                {thread.budgetFlexible ? 'Flexible Budget' : 'Fixed Budget'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-semibold mb-3">Thread Author Information</h3>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="relative">
                            <img 
                                src={thread.userId?.profileImage} 
                                alt={thread.userId?.userName}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                                    {thread.userId?.isLive && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h4 className="font-semibold">{thread.userId?.userName}</h4>
                                    {thread.userId?.is_Id_verified && (
                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                        <FaShield className="w-2 h-2 text-white" />
                                    </div>
                                    )}
                                    {thread.userId?.is_Preferred_seller && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                        Preferred
                                    </span>
                                    )}
                            </div>
                            <p className="text-gray-500 text-sm">{thread.userId?.provinceId?.value}</p>
                        </div>
                    </div>

                    {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
                        <div className="flex justify-between py-1">
                            <span className="text-gray-600 text-sm">Status</span>
                            <span className={`text-sm font-medium flex items-center ${thread.userId?.isLive ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                <span className={`w-2 h-2 rounded-full mr-1 ${thread.userId?.isLive ? 'bg-green-500' : 'bg-gray-400'
                                    }`}></span>
                                {thread.userId?.isLive ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-gray-600 text-sm">ID Verification</span>
                            <span className={`text-sm font-medium ${thread.userId?.is_Id_verified ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {thread.userId?.is_Id_verified ? 'Verified' : 'Not Verified'}
                            </span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-gray-600 text-sm">Seller Status</span>
                            <span className={`text-sm font-medium ${thread.userId?.is_Preferred_seller ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                {thread.userId?.is_Preferred_seller ? 'Preferred' : 'Regular'}
                            </span>
                        </div>
                    </div> */}
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Images */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="relative mb-4">
                            <img 
                                src={thread.photos[selectedImage]} 
                                alt={thread.title}
                                    className="w-full h-64 object-cover rounded-lg"
                            />
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                                    {selectedImage + 1} / {thread.photos.length}
                                </div>
                        </div>
                            <div className="grid grid-cols-4 gap-2">
                            {thread.photos.map((photo, index) => (
                                <img 
                                    key={index}
                                    src={photo} 
                                    alt={`${thread.title} ${index + 1}`}
                                        className={`w-full h-16 object-cover rounded cursor-pointer border-2 ${selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                                            }`}
                                    onClick={() => setSelectedImage(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                    {/* Right Column - Thread Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">{thread.title}</h2>
                            <p className="text-gray-600 mb-4 text-sm leading-relaxed">{thread.description}</p>

                            {/* Tags */}
                            {thread.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {thread.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Budget Information */}
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Budget Range</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {thread.budgetFlexible ? 'Flexible' : `฿${thread.budgetRange?.min?.toLocaleString()} - ฿${thread.budgetRange?.max?.toLocaleString()}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Thread Specifications */}
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <h3 className="text-lg font-semibold mb-3">Thread Specifications</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600 text-sm">Category</span>
                                    <span className="font-medium text-sm">{thread.categoryId?.name}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600 text-sm">Subcategory</span>
                                    <span className="font-medium text-sm">{thread.subCategoryName}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600 text-sm">Total Likes</span>
                                    <span className="font-medium text-sm flex items-center">
                                        {/* <FaHeart className="w-3 h-3 mr-1 text-red-500" /> */}
                                        {thread.totalLikes}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600 text-sm">Total Comments</span>
                                    <span className="font-medium text-sm flex items-center">
                                        {/* <FaComment className="w-3 h-3 mr-1 text-blue-500" /> */}
                                        {thread.totalComments}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600 text-sm">View Count</span>
                                    <span className="font-medium text-sm flex items-center">
                                        {/* <FaEye className="w-3 h-3 mr-1 text-green-500" /> */}
                                        {thread.viewCount || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600 text-sm">Associated Products</span>
                                    <span className="font-medium text-sm">{thread.totalAssociatedProducts || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Author Information Section */}


                {/* Thread Statistics */}
                <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-semibold mb-3">Thread Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex justify-between py-1">
                            <span className="text-gray-600 text-sm">Created Date</span>
                            <span className="font-medium text-sm">
                                {new Date(thread.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-gray-600 text-sm">Last Updated</span>
                            <span className="font-medium text-sm">
                                {new Date(thread.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-gray-600 text-sm">Thread Status</span>
                            <span className={`text-sm font-medium ${thread.isClosed ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {thread.isClosed ? 'Closed' : 'Active'}
                            </span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-gray-600 text-sm">Budget Type</span>
                            <span className="text-sm font-medium">
                                {thread.budgetFlexible ? 'Flexible' : 'Fixed Range'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Associated Products Section */}
                {/* {thread.associatedProducts?.length > 0 && (
                    <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
                        <h3 className="text-lg font-semibold mb-4">Associated Products ({thread.totalAssociatedProducts})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {thread.associatedProducts.map(product => (
                                <div key={product._id} className="border rounded-lg p-4">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 flex-shrink-0">
                                        {product.productImages?.length > 0 ? (
                                            <img 
                                                src={product.productImages[0]} 
                                                alt={product.title}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">No image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                            <h4 className="font-medium text-sm mb-1">{product.title}</h4>
                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                                            <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">
                                                        {product.saleType === 'fixed' ? (
                                                        `฿${product.fixedPrice?.toLocaleString()}`
                                                        ) : (
                                                        `Auction • ${product.totalBids || 0} bids`
                                                        )}
                                                    </span>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    product.isSold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {product.isSold ? 'Sold' : 'Available'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                            <img 
                                                src={product.seller?.profileImage} 
                                                alt={product.seller?.userName}
                                                    className="w-4 h-4 rounded-full"
                                            />
                                                <span className="text-xs text-gray-600">{product.seller?.userName}</span>
                                            {product.seller?.is_Verified_Seller && (
                                                    <span className="text-blue-500 text-xs">✓</span>
                                            )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )} */}

            </div>
        </div>
    )
}
