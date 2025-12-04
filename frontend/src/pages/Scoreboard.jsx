import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { scoreboardAPI } from '../utils/api';
import Loading from '../components/Loading';
import { FiAward, FiStar, FiUser, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Scoreboard = () => {
  const [scoreboard, setScoreboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScoreboard();
  }, []);

  const fetchScoreboard = async () => {
    try {
      setLoading(true);
      const response = await scoreboardAPI.getScoreboard();
      if (response.success) {
        setScoreboard(response.data.scoreboard);
      }
    } catch (error) {
      toast.error('Failed to load scoreboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FiAward className="text-yellow-400 text-2xl" />;
    if (rank === 2) return <FiStar className="text-gray-300 text-2xl" />;
    if (rank === 3) return <FiTrendingUp className="text-orange-400 text-2xl" />;
    return <span className="text-white/50 font-bold">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
    if (rank === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
    if (rank === 3) return 'from-orange-500/20 to-orange-600/20 border-orange-500/50';
    return 'from-white/5 to-white/10 border-white/10';
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">Leaderboard</h1>
          <p className="text-white/70">Top performers in CTF Platform</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loading text="Loading scoreboard..." />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top 3 Podium */}
            {scoreboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 0, 2].map((index) => {
                  const user = scoreboard[index];
                  if (!user) return null;
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`glass-effect rounded-xl p-6 text-center ${
                        index === 0 ? 'transform scale-110' : ''
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        {getRankIcon(user.rank)}
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <FiUser className="text-white text-2xl" />
                      </div>
                      <h3 className="font-bold text-white mb-1">{user.username}</h3>
                      <p className="text-2xl font-bold gradient-text">{user.total_points}</p>
                      <p className="text-sm text-white/50">{user.solved_challenges} solves</p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Rest of Leaderboard */}
            <div className="space-y-2">
              {scoreboard.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 3) * 0.05 }}
                  className={`glass-effect rounded-lg p-4 flex items-center justify-between border-2 ${getRankColor(user.rank)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex justify-center">
                      {getRankIcon(user.rank)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <FiUser className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{user.username}</h3>
                        <p className="text-sm text-white/50">{user.solved_challenges} challenges solved</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold gradient-text">{user.total_points}</p>
                    <p className="text-xs text-white/50">points</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {scoreboard.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 glass-effect rounded-xl"
              >
                <p className="text-white/70 text-lg">No scores yet. Be the first!</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;

