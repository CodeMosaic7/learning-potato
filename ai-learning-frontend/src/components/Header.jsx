import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";


const Header = () => {
    const navi= useNavigate();
    const gotologin = () => {
    navi('/Login');
  };
  const gotohome = () => {
    navi('/');
  }
  return (<nav className="relative z-10 container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative" onClick={gotohome}>
              <Brain className="w-10 h-10 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" onClick={gotohome}>
              mello.ai
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">Features</a>
            <a href="#about" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">About</a>
            <button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              onClick={gotologin}>
              Login
            </button>
          </div>
        </div>
      </nav>);
}

export default Header;