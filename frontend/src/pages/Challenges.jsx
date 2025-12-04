import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { challengeAPI } from '../utils/api';
import ChallengeCard from '../components/ChallengeCard';
import Loading from '../components/Loading';
import { FiSearch, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Challenges = () => {
  const { isAdmin } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'easy',
    points: 100,
    flag: '',
  });

  useEffect(() => {
    fetchChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await challengeAPI.getAll(filters);
      if (response.success) {
        setChallenges(response.data.challenges);
      } else {
        toast.error(response.message || 'Failed to load challenges');
      }
    } catch (error) {
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleNewChallengeChange = (key, value) => {
    setNewChallenge((prev) => ({
      ...prev,
      [key]: key === 'points' ? Number(value) || 0 : value,
    }));
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!newChallenge.title || !newChallenge.description || !newChallenge.category || !newChallenge.difficulty || !newChallenge.points || !newChallenge.flag) {
      toast.error('All fields are required');
      return;
    }

    if (!['easy', 'medium', 'hard'].includes(newChallenge.difficulty)) {
      toast.error('Difficulty must be: easy, medium, or hard');
      return;
    }

    if (newChallenge.points <= 0 || !Number.isInteger(newChallenge.points)) {
      toast.error('Points must be a positive integer');
      return;
    }

    try {
      setCreateLoading(true);
      const response = await challengeAPI.create(newChallenge);
      if (response.success) {
        toast.success('Challenge created successfully');
        setIsCreateOpen(false);
        setNewChallenge({
          title: '',
          description: '',
          category: '',
          difficulty: 'easy',
          points: 100,
          flag: '',
        });
        // Refresh list
        fetchChallenges();
      } else {
        toast.error(response.message || 'Failed to create challenge');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create challenge');
    } finally {
      setCreateLoading(false);
    }
  };

  const categories = ['Web', 'Crypto', 'Forensics', 'Reverse', 'Pwn', 'Misc'];
  const difficulties = ['easy', 'medium', 'hard'];

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Challenges</h1>
            <p className="text-white/70">Test your skills and solve CTF challenges</p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" />
              Create Challenge
            </button>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-6 mb-8"
        >
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900">
                  {cat}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="input-field"
            >
              <option value="">All Difficulties</option>
              {difficulties.map((diff) => (
                <option key={diff} value={diff} className="bg-slate-900 capitalize">
                  {diff}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loading text="Loading challenges..." />
          </div>
        ) : challenges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 glass-effect rounded-xl"
          >
            <p className="text-white/70 text-lg">No challenges found</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge, index) => (
              <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      {isAdmin && isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-xl p-6 w-full max-w-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Create New Challenge</h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-white/60 hover:text-white text-sm"
                disabled={createLoading}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newChallenge.title}
                  onChange={(e) => handleNewChallengeChange('title', e.target.value)}
                  className="input-field"
                  placeholder="Challenge title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Description
                </label>
                <textarea
                  value={newChallenge.description}
                  onChange={(e) => handleNewChallengeChange('description', e.target.value)}
                  className="input-field min-h-[120px]"
                  placeholder="Describe the challenge, rules, and any hints."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Category
                  </label>
                  <select
                    value={newChallenge.category}
                    onChange={(e) => handleNewChallengeChange('category', e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newChallenge.difficulty}
                    onChange={(e) => handleNewChallengeChange('difficulty', e.target.value)}
                    className="input-field"
                    required
                  >
                    {difficulties.map((diff) => (
                      <option key={diff} value={diff} className="bg-slate-900 capitalize">
                        {diff}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={newChallenge.points}
                    onChange={(e) => handleNewChallengeChange('points', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Flag
                  </label>
                  <input
                    type="text"
                    value={newChallenge.flag}
                    onChange={(e) => handleNewChallengeChange('flag', e.target.value)}
                    className="input-field"
                    placeholder="CTF{your_flag_here}"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating...' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Challenges;

