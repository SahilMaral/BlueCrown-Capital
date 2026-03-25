import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import UserIcon from '../../components/icons/UserIcon';
import EmailIcon from '../../components/icons/EmailIcon';
import LockIcon from '../../components/icons/LockIcon';
import KeyIcon from '../../components/icons/KeyIcon';
import ShieldIcon from '../../components/icons/ShieldIcon';
import '../Dashboard/Dashboard.css';
import '../Login/Auth.css';

const Settings = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        designation: user?.designation || '',
    });
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(user?.photo ? (user.photo.startsWith('data:') ? user.photo : `${import.meta.env.VITE_API_URL.replace('/api/v1', '')}/uploads/${user.photo}`) : null);
    
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    
    const [profileMessage, setProfileMessage] = useState(null);
    const [passwordMessage, setPasswordMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const onPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('name', profileData.name);
            formData.append('email', profileData.email);
            formData.append('phone', profileData.phone);
            formData.append('designation', profileData.designation);
            if (photo) {
                formData.append('photo', photo);
            }

            await axios.put(`${import.meta.env.VITE_API_URL}/auth/updatedetails`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
            dispatch(fetchCurrentUser());
        } catch (err) {
            setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/auth/updatepassword`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
        }
    };

    return (
        <main className="main-content">
            <header className="dashboard-header">
                <div className="welcome-section">
                    <h1>Elite Settings</h1>
                    <p>Manage your professional profile and security preferences.</p>
                </div>
            </header>

            <section className="content-section" style={{ marginBottom: '32px' }}>
                <div className="section-header">
                    <h2>Account Profile</h2>
                </div>

                {profileMessage && (
                    <div className={`auth-error ${profileMessage.type === 'success' ? 'success' : ''}`} style={{ marginBottom: '24px', background: profileMessage.type === 'success' ? '#f0fdf4' : '#fef2f2', borderColor: profileMessage.type === 'success' ? '#bbf7d0' : '#fee2e2', color: profileMessage.type === 'success' ? '#166534' : '#b91c1c' }}>
                        {profileMessage.text}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleProfileSubmit}>
                    <div className="form-grid-elite">
                        <div className="settings-profile-photo-section">
                            <div className="profile-photo-wrapper" style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #e2e8f0', background: '#f8fafc', position: 'relative' }}>
                                {preview ? (
                                    <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                        <UserIcon size={48} />
                                    </div>
                                )}
                            </div>
                            <div className="photo-upload-controls">
                                <label className="btn-elite" style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer', display: 'inline-block' }}>
                                    Change Photo
                                    <input type="file" onChange={onPhotoChange} style={{ display: 'none' }} accept="image/*" />
                                </label>
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>JPEG, PNG allowed. Max 1MB.</p>
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="form-label-elite">Full Name</label>
                            <div className="auth-input-wrapper">
                                {loading ? (
                                    <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                                ) : (
                                    <>
                                        <UserIcon className="auth-input-icon" />
                                        <input 
                                            type="text" 
                                            placeholder="Enter your name" 
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                            required 
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="form-label-elite">Email Address</label>
                            <div className="auth-input-wrapper">
                                {loading ? (
                                    <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                                ) : (
                                    <>
                                        <EmailIcon className="auth-input-icon" />
                                        <input 
                                            type="email" 
                                            placeholder="Enter your email" 
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                            required 
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="form-label-elite">Phone Number</label>
                            <div className="auth-input-wrapper">
                                {loading ? (
                                    <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                                ) : (
                                    <>
                                        <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 19.92z"></path>
                                        </svg>
                                        <input 
                                            type="text" 
                                            placeholder="Enter phone number" 
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="form-label-elite">Designation</label>
                            <div className="auth-input-wrapper">
                                {loading ? (
                                    <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                                ) : (
                                    <>
                                        <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                        </svg>
                                        <input 
                                            type="text" 
                                            placeholder="Enter designation" 
                                            value={profileData.designation}
                                            onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="settings-submit-container">
                            {loading ? (
                                <div className="skeleton skeleton-text" style={{ width: '160px', height: '48px', borderRadius: '12px' }}></div>
                            ) : (
                                <button type="submit" className="btn-elite">Update Profile</button>
                            )}
                        </div>
                    </div>
                </form>
            </section>

            <section className="content-section">
                <div className="section-header">
                    <h2>Security & Privacy</h2>
                </div>

                {passwordMessage && (
                    <div className={`auth-error ${passwordMessage.type === 'success' ? 'success' : ''}`} style={{ marginBottom: '24px', background: passwordMessage.type === 'success' ? '#f0fdf4' : '#fef2f2', borderColor: passwordMessage.type === 'success' ? '#bbf7d0' : '#fee2e2', color: passwordMessage.type === 'success' ? '#166534' : '#b91c1c' }}>
                        {passwordMessage.text}
                    </div>
                )}

                <form className="auth-form" onSubmit={handlePasswordSubmit}>
                    <div className="form-grid-elite">
                        <div className="auth-input-group">
                            <label className="form-label-elite">Current Password</label>
                            <div className="auth-input-wrapper">
                                {loading ? (
                                    <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                                ) : (
                                    <>
                                        <LockIcon className="auth-input-icon" />
                                        <input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                            required 
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="desktop-spacer"></div>

                        <div className="auth-input-group">
                            <label className="form-label-elite">New Elite Password</label>
                            <div className="auth-input-wrapper">
                                {loading ? (
                                    <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                                ) : (
                                    <>
                                        <KeyIcon className="auth-input-icon" />
                                        <input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            required 
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="form-label-elite">Confirm Password</label>
                            <div className="auth-input-wrapper">
                                {loading ? (
                                    <div className="skeleton-row skeleton" style={{ margin: 0, height: '48px', borderRadius: '12px' }}></div>
                                ) : (
                                    <>
                                        <ShieldIcon className="auth-input-icon" />
                                        <input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            required 
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="settings-submit-container">
                            {loading ? (
                                <div className="skeleton skeleton-text" style={{ width: '180px', height: '48px', borderRadius: '12px' }}></div>
                            ) : (
                                <button type="submit" className="btn-elite">Change Password</button>
                            )}
                        </div>
                    </div>
                </form>
            </section>
        </main>
  );
};

export default Settings;
