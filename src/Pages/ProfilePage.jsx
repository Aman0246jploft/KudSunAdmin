import React, { useState, useEffect } from 'react';
import authAxiosClient from '../api/authAxiosClient';
import { useDispatch } from 'react-redux';
import { getLoginProfile } from '../features/slices/userSlice';

const ProfilePage = () => {
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
            setFormData((prev) => ({ ...prev, image: null })); // reset selected file
            await fetchProfile(); // reload profile data to reset form with updated data

            dispatch(getLoginProfile())
        } catch (error) {
            console.error('Update profile error:', error);
            setError(
                error.response?.data?.message || 'Failed to update profile. Please try again.'
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-20">Loading profile...</div>;

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-center">Profile Page</h2>

            {error && (
                <div className="mb-4 text-red-600 text-center font-medium">{error}</div>
            )}
            {successMsg && (
                <div className="mb-4 text-green-600 text-center font-medium">{successMsg}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {preview && (
                    <div className="mb-4">
                        <img
                            src={preview}
                            alt="Profile Preview"
                            className="w-32 h-32 object-cover rounded-full mx-auto border"
                        />
                    </div>
                )}

                <div>
                    <label className="block mb-1 font-medium">Profile Image</label>
                    <input
                        type="file"
                        name="profileImage" // MUST match backend multer.single('profileImage')
                        accept="image/*"
                        onChange={handleChange}
                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4
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
                        {submitLoading ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
