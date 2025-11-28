import { Brain } from "lucide-react";
const Footer=() => {
    return(
        <footer className="relative z-10 container mx-auto px-6 py-12 border-t border-purple-500/30">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              mello.ai                                                                                                                                                                                                                                                                                                                                                                                                                                            
            </span>
          </div>
          <div className="flex space-x-6 text-gray-400">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8">                                                                          
          © 2025 AI Learning Platform. All rights reserved.                                                                                                                                             
        </div>
      </footer>
    )
}

export default Footer;