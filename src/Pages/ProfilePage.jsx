import React, { useState, useEffect } from 'react';
import authAxiosClient from '../api/authAxiosClient';
import { useDispatch } from 'react-redux';
import { getLoginProfile } from '../features/slices/userSlice';
import { Pencil } from 'lucide-react'; // or any icon library
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';



const ProfilePage = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        image: null, // File object or null
        userName: '',
        email: '',
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const dispatch = useDispatch()
    // Fetch profile on mount and after update
    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await authAxiosClient.get('/user/getProfile');
            const data = res.data?.data;

            setFormData({
                image: null,
                userName: data.userName || '',
                email: data.email || '',
            });
            setPreview(data.profileImage || null);
            setError(null);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Update image preview when user selects new image file
    useEffect(() => {
        if (!formData.image) return;

        const objectUrl = URL.createObjectURL(formData.image);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [formData.image]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profileImage') {
            const file = files[0];
            setFormData((prev) => ({
                ...prev,
                image: file,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
        setError(null);
        setSuccessMsg(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const formPayload = new FormData();
            formPayload.append('userName', formData.userName);
            formPayload.append('email', formData.email);

            if (formData.image) {
                formPayload.append('profileImage', formData.image); // backend expects this name
            }

            const res = await authAxiosClient.post('/user/updateProfile', formPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccessMsg('Profile updated successfully!');
            setFormData((prev) => ({ ...prev, image: null }));
            await fetchProfile();
            dispatch(getLoginProfile());

            // Delay for 1s then navigate
            setTimeout(() => {
                setSuccessMsg("");
                navigate('/dashboard');
            }, 1000);

        } catch (error) {
            console.error('Update profile error:', error);
            setError(
                error.response?.data?.message || 'Failed to update profile. Please try again.'
            );
        } finally {
            setSubmitLoading(false);
            setTimeout(() => {
                setSuccessMsg("");
            }, 1000);
        }
    };

    if (loading) return <div className="text-center mt-20">Loading profile...</div>;

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-center">Update Profile</h2>

            {error && (
                <div className="mb-4 text-red-600 text-center font-medium">{error}</div>
            )}
            {successMsg && (
                <div className="mb-4 text-green-600 text-center font-medium">{successMsg}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {preview && (
                    <div className="mb-4 relative w-fit mx-auto">
                        {preview && (
                            <img
                                src={preview}
                                alt="Profile Preview"
                                className="w-32 h-32 object-cover rounded-full border"
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-gray-100"
                        >
                            <Pencil size={16} />
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            name="profileImage"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                        />
                    </div>

                )}

                <div>
                    <label className="block mb-1 hidden font-medium">Profile Image</label>
                    <input
                        type="file"
                        name="profileImage" // MUST match backend multer.single('profileImage')
                        accept="image/*"
                        onChange={handleChange}
                        className="block w-full hidden text-sm file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Username</label>
                    <input
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        required
                    />
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        disabled={submitLoading}
                        className={`px-6 py-2 rounded-lg text-white transition ${submitLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {submitLoading ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
