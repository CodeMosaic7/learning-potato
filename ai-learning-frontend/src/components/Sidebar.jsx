const Sidebar = ({ activeTab, setActiveTab, user }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'blue' },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, color: 'green' },
    { id: 'upload', label: 'Upload Content', icon: Upload, color: 'purple' },
    { id: 'quiz', label: 'Quiz Generator', icon: Trophy, color: 'yellow' },
    { id: 'grades', label: 'Grades', icon: BarChart3, color: 'red' },
    { id: 'progress', label: 'Progress', icon: TrendingUp, color: 'indigo' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-dark-800 to-dark-900 border-r border-dark-700 h-screen flex flex-col">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">EduMind AI</h2>
            <p className="text-xs text-dark-400">Smart Learning Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              activeTab === item.id
                ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                : 'text-dark-300 hover:bg-dark-700 hover:text-white hover:scale-105'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.name || 'John Doe'}</p>
            <p className="text-xs text-dark-400">Premium Student</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;