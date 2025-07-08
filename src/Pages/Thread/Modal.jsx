import React from 'react';
import Button from '../../Component/Atoms/Button/Button';

export default function ProductsModal({ isOpen, onClose, products }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Associated Products</h3>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="grid grid-cols-1 gap-4">
                        {products.map(product => (
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
            </div>
        </div>
    );
} 