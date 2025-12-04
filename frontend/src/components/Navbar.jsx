import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiShield, FiHome, FiFlag, FiAward } from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/challenges', label: 'Challenges', icon: FiFlag },
    { path: '/scoreboard', label: 'Scoreboard', icon: FiAward },
  ];

  return (
    <motion.nav
      className="glass-effect sticky top-0 z-50 backdrop-blur-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center"
            >
              <FiFlag className="text-white text-xl" />
            </motion.div>
            <span className="text-xl font-bold gradient-text">CTF Platform</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <item.icon />
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-white/70">
                  {isAdmin && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-600/30 rounded"
                    >
                      <FiShield className="text-purple-400" />
                      <span className="text-xs">Admin</span>
                    </motion.div>
                  )}
                  <div className="flex items-center gap-2">
                    <FiUser />
                    <span className="hidden sm:inline">{user?.username}</span>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="btn-secondary text-sm"
                >
                  Profile
                </Link>
                <motion.button
                  onClick={handleLogout}
                  className="btn-secondary text-sm flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiLogOut />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

