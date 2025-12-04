import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { challengeAPI, submissionAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import { FiFlag, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ChallengeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [flag, setFlag] = useState('');
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchChallenge();
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [id, isAuthenticated]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const response = await challengeAPI.getById(id);
      if (response.success) {
        setChallenge(response.data.challenge);
      }
    } catch (error) {
      toast.error('Failed to load challenge');
      navigate('/challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await submissionAPI.getMy({ challenge_id: id });
      if (response.success) {
        setSubmissions(response.data.submissions);
      }
    } catch (error) {
      // Ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to submit flags');
      navigate('/login');
      return;
    }

    if (!flag.trim()) {
      toast.error('Please enter a flag');
      return;
    }

    setSubmitting(true);
    try {
      const response = await submissionAPI.submit({
        challenge_id: id,
        flag: flag.trim(),
      });
      if (response.success) {
        if (response.data.correct) {
          toast.success(`Correct! You earned ${challenge.points} points!`);
          setFlag('');
          fetchChallenge();
          fetchSubmissions();
        } else {
          toast.error('Incorrect flag. Try again!');
        }
      }
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const hasSolved = submissions.some((s) => s.is_correct === 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading challenge..." />
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  const difficultyColors = {
    easy: 'from-green-500 to-emerald-500',
    medium: 'from-yellow-500 to-orange-500',
    hard: 'from-red-500 to-pink-500',
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="container mx-auto max-w-4xl">
        <motion.button
          onClick={() => navigate('/challenges')}
          className="btn-secondary mb-6 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiArrowLeft /> Back to Challenges
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-8 mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{challenge.title}</h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white/10 rounded">{challenge.category}</span>
                <span
                  className={`px-3 py-1 bg-gradient-to-r ${difficultyColors[challenge.difficulty]} rounded text-white font-semibold capitalize`}
                >
                  {challenge.difficulty}
                </span>
                <span className="text-yellow-400 font-bold text-xl">{challenge.points} pts</span>
                {hasSolved && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500 text-green-400 rounded flex items-center gap-1">
                    <FiCheck /> Solved
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-white/90 text-lg whitespace-pre-line">{challenge.description}</p>
          </div>

          {/* Submit Flag */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="mt-8">
              <label className="block text-white/70 mb-2">Submit Flag</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="FLAG{...}"
                  className="input-field flex-1"
                  disabled={hasSolved || submitting}
                />
                <motion.button
                  type="submit"
                  className="btn-primary"
                  disabled={hasSolved || submitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {submitting ? (
                    <Loading size="sm" text="" />
                  ) : (
                    <>
                      <FiFlag className="inline mr-2" />
                      Submit
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          ) : (
            <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
              <p className="text-yellow-400">
                Please <button onClick={() => navigate('/login')} className="underline font-semibold">login</button> to submit flags
              </p>
            </div>
          )}

          {/* Submission History */}
          {isAuthenticated && submissions.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Submission History</h3>
              <div className="space-y-2">
                {submissions.slice(0, 5).map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded"
                  >
                    <span className="text-white/70 font-mono text-sm">{submission.flag}</span>
                    {submission.is_correct ? (
                      <FiCheck className="text-green-400" />
                    ) : (
                      <FiX className="text-red-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ChallengeDetail;

