import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { scoreboardAPI, authAPI } from '../utils/api';
import Loading from '../components/Loading';
import { FiUser, FiMail, FiAward, FiFlag, FiEdit2, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username, email: user.email });
      fetchScore();
    }
  }, [user]);

  const fetchScore = async () => {
    try {
      const response = await scoreboardAPI.getMyScore();
      if (response.success) {
        setScore(response.data.score);
      }
    } catch (error) {
      // Ignore if not authenticated
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.updateProfile(formData);
      if (response.success) {
        updateUser(response.data.user);
        setEditMode(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        toast.success('Password changed successfully');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">Profile</h1>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 glass-effect rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Personal Information</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <FiEdit2 /> Edit
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-white/70 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/70 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({ username: user.username, email: user.email });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiUser className="text-white/50 text-xl" />
                  <div>
                    <p className="text-white/50 text-sm">Username</p>
                    <p className="text-white font-semibold">{user?.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiMail className="text-white/50 text-xl" />
                  <div>
                    <p className="text-white/50 text-sm">Email</p>
                    <p className="text-white font-semibold">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiAward className="text-white/50 text-xl" />
                  <div>
                    <p className="text-white/50 text-sm">Role</p>
                    <p className="text-white font-semibold capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Change Password */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Change Password</h3>
              {showPasswordForm ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-white/70 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-primary">
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiLock /> Change Password
                </button>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Statistics</h2>
            <div className="space-y-6">
              <div className="text-center">
                <FiAward className="text-4xl text-yellow-400 mx-auto mb-2" />
                <p className="text-3xl font-bold gradient-text">
                  {score?.total_points || 0}
                </p>
                <p className="text-white/70 text-sm">Total Points</p>
              </div>
              <div className="text-center">
                <FiFlag className="text-4xl text-purple-400 mx-auto mb-2" />
                <p className="text-3xl font-bold gradient-text">
                  {score?.solved_challenges || 0}
                </p>
                <p className="text-white/70 text-sm">Challenges Solved</p>
              </div>
              <div className="text-center">
                <FiAward className="text-4xl text-pink-400 mx-auto mb-2" />
                <p className="text-3xl font-bold gradient-text">
                  {score?.rank || '-'}
                </p>
                <p className="text-white/70 text-sm">Rank</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

