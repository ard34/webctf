import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiFlag, FiUsers, FiStar } from 'react-icons/fi';

const ChallengeCard = ({ challenge, index }) => {
  const difficultyColors = {
    easy: 'from-green-500 to-emerald-500',
    medium: 'from-yellow-500 to-orange-500',
    hard: 'from-red-500 to-pink-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="glass-effect rounded-xl p-6 card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <span className="px-2 py-1 bg-white/10 rounded">{challenge.category}</span>
            <span
              className={`px-2 py-1 bg-gradient-to-r ${difficultyColors[challenge.difficulty]} rounded text-white font-semibold`}
            >
              {challenge.difficulty}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-400">
          <FiStar />
          <span className="font-bold">{challenge.points}</span>
        </div>
      </div>

      <p className="text-white/70 mb-4 line-clamp-2">{challenge.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-white/50">
          <div className="flex items-center gap-1">
            <FiUsers />
            <span>{challenge.solve_count || 0} solves</span>
          </div>
        </div>

        <Link
          to={`/challenges/${challenge.id}`}
          className="btn-primary text-sm"
        >
          <FiFlag className="inline mr-2" />
          View Challenge
        </Link>
      </div>
    </motion.div>
  );
};

export default ChallengeCard;

