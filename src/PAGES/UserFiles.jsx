import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { FaEdit, FaTrash, FaFileAlt, FaHome, FaShareAlt } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const UserFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleEdit = (id) => {
    navigate(`/editor/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
      toast.success('File deleted successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleShare = (id) => {
    const shareUrl = `${window.location.origin}/editor/${id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const renderPlaceholder = () => (
    <div className="relative rounded-xl shadow-2xl bg-gray-800 border border-gray-700 animate-pulse">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gray-7w00 rounded-lg">
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
          </div>
          <div className="h-5 bg-gray-600 rounded w-1/2"></div>
        </div>
        <div className="h-4 bg-gray-600 rounded mb-4"></div>
        <div className="h-4 bg-gray-600 rounded mb-4 w-3/4"></div>
        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
          <div className="flex-1 h-10 bg-gray-600 rounded-lg"></div>
          <div className="flex-1 h-10 bg-gray-600 rounded-lg"></div>
          <div className="flex-1 h-10 bg-gray-600 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center ml-0 sm:ml-8">
            <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center text-sm sm:text-base">
              <FaHome className="mr-1" />
              Home
            </Link>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-gray-200 text-sm sm:text-base">Your Files</span>
          </div>
        </div>
        {files.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] px-4">
            <FaFileAlt className="w-16 h-16 sm:w-24 sm:h-24 text-gray-600 mb-4" />
            <p className="text-xl sm:text-2xl text-gray-400 text-center">No files found</p>
            <p className="text-gray-500 mt-2 text-sm sm:text-base text-center">Create your first document to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ml-0 sm:ml-8">
            {loading ? (
              [...Array(6)].map((_, index) => (
                <div key={index}>
                  {renderPlaceholder()}
                </div>
              ))
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className="relative rounded-xl shadow-2xl bg-gray-8w00 border border-gray-700 hover:border-blue-500 transition-all duration-300 group"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gray-700 rounded-lg">
                        <FaFileAlt className="w-6 h-6 text-blue-400" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-semibold text-white">Document {file.file_name.slice(0, 6)}</h2>
                    </div>
                    <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                      Created: {new Date(file.created_at).toLocaleString()}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(file.id)}
                        className="hover:bg-gray-600 text-yellow-400 font-medium py-2 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-sm sm:text-base"
                      >
                        <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleShare(file.id)}
                        className="hover:bg-gray-600 text-yellow-400 font-medium py-2 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-sm sm:text-base"
                      >
                        <FaShareAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="hover:bg-gray-600 text-yellow-400 font-medium py-2 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-sm sm:text-base"
                      >
                        <FaTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFiles;