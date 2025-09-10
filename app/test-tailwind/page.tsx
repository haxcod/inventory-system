export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Tailwind CSS Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Primary Colors</h2>
            <div className="space-y-2">
              <div className="bg-blue-500 text-white p-2 rounded">Blue 500</div>
              <div className="bg-green-500 text-white p-2 rounded">Green 500</div>
              <div className="bg-red-500 text-white p-2 rounded">Red 500</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Buttons</h2>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Primary Button
              </button>
              <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                Secondary Button
              </button>
              <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded">
                Outline Button
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Forms</h2>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Enter your name" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Typography</h2>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">Heading 3</h3>
              <p className="text-gray-600">This is a paragraph with some text.</p>
              <p className="text-sm text-gray-500">Small text</p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Spacing</h2>
            <div className="space-y-2">
              <div className="bg-blue-100 p-2 rounded">Padding 2</div>
              <div className="bg-green-100 p-4 rounded">Padding 4</div>
              <div className="bg-red-100 p-6 rounded">Padding 6</div>
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Animations</h2>
            <div className="space-y-2">
              <div className="bg-purple-500 text-white p-2 rounded animate-pulse">Pulse Animation</div>
              <div className="bg-yellow-500 text-white p-2 rounded animate-bounce">Bounce Animation</div>
              <div className="bg-pink-500 text-white p-2 rounded hover:scale-105 transition-transform">Hover Scale</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 p-4 bg-green-100 border border-green-400 rounded-md">
          <p className="text-green-800 font-medium">
            ✅ If you can see this page with proper styling, Tailwind CSS is working correctly!
          </p>
        </div>
      </div>
    </div>
  );
}
