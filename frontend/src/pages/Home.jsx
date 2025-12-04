import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiFlag, FiAward, FiUsers, FiArrowRight, FiShield } from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();

  const features = [
    {
      icon: FiFlag,
      title: 'Challenges',
      description: 'Solve CTF challenges and improve your skills',
      link: '/challenges',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FiAward,
      title: 'Scoreboard',
      description: 'Compete with others and climb the leaderboard',
      link: '/scoreboard',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: FiUsers,
      title: 'Community',
      description: 'Join a community of security enthusiasts',
      link: '/scoreboard',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="container mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold gradient-text mb-4"
          >
            CTF Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/70 max-w-2xl mx-auto mb-8"
          >
            Test your cybersecurity skills with our collection of Capture The Flag challenges.
            Learn, compete, and grow.
          </motion.p>

          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/challenges" className="btn-primary text-lg px-8 py-4">
                Start Hacking <FiArrowRight className="inline ml-2" />
              </Link>
              <Link to="/scoreboard" className="btn-secondary text-lg px-8 py-4">
                View Leaderboard
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Get Started <FiArrowRight className="inline ml-2" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Login
              </Link>
            </motion.div>
          )}

          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 glass-effect rounded-lg p-4 inline-block"
            >
              <p className="text-white/70">
                Welcome back, <span className="text-purple-400 font-semibold">{user?.username}</span>!
                {isAdmin && (
                  <span className="ml-2 px-2 py-1 bg-purple-600/30 rounded text-purple-400 text-sm">
                    <FiShield className="inline mr-1" />
                    Admin
                  </span>
                )}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-effect rounded-xl p-6 card-hover"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/70 mb-4">{feature.description}</p>
              <Link
                to={feature.link}
                className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-2"
              >
                Explore <FiArrowRight />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="glass-effect rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Quick Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">0</p>
                <p className="text-white/70">Challenges Solved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">0</p>
                <p className="text-white/70">Total Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">-</p>
                <p className="text-white/70">Rank</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">0</p>
                <p className="text-white/70">Submissions</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;

