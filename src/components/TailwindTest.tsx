const TailwindTest = () => {
  return (
    <div data-testid="tailwind-container" className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
      <div data-testid="tailwind-card" className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Tailwind CSS Test
        </h1>
        <p className="text-red-600 hover:text-blue-500 transition-colors">
          If you can see this styled nicely, Tailwind is working! 🎉
        </p>
      </div>
    </div>
  );
};

export default TailwindTest; 