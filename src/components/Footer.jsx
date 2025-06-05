const Footer = () => {
  return (
    <footer className="py-6 border-t border-gray-700 mt-16">
      <div className="container mx-auto px-4 max-w-7xl text-center">
        <p className="text-gray-300 text-sm">
          &copy; {new Date().getFullYear()} SnipShare. All rights reserved.
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Built with ❤️ by developers for developers
        </p>
      </div>
    </footer>
  );
};

export default Footer;
