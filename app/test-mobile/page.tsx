export default function TestMobile() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Mobile Header Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Card 1 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Mobile Header Features</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✅ Fixed header with proper positioning</li>
              <li>✅ Hamburger menu button</li>
              <li>✅ App title display</li>
              <li>✅ User avatar and theme toggle</li>
              <li>✅ Proper z-index layering</li>
            </ul>
          </div>

          {/* Test Card 2 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Mobile Sidebar Features</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✅ Slides in from left</li>
              <li>✅ Overlay background</li>
              <li>✅ Closes on navigation</li>
              <li>✅ Responsive design</li>
              <li>✅ Touch-friendly buttons</li>
            </ul>
          </div>

          {/* Test Card 3 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Content Area</h2>
            <p className="text-gray-600 mb-4">
              This content should be properly spaced below the mobile header.
              The header should not overlap with this content.
            </p>
            <div className="space-y-2">
              <div className="bg-blue-100 p-3 rounded">Test content 1</div>
              <div className="bg-green-100 p-3 rounded">Test content 2</div>
              <div className="bg-yellow-100 p-3 rounded">Test content 3</div>
            </div>
          </div>

          {/* Test Card 4 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Responsive Test</h2>
            <p className="text-gray-600 mb-4">
              Test the mobile header on different screen sizes:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Mobile (< 768px):</span>
                <span className="text-green-600">Header visible</span>
              </div>
              <div className="flex justify-between">
                <span>Tablet (768px+):</span>
                <span className="text-green-600">Header visible</span>
              </div>
              <div className="flex justify-between">
                <span>Desktop (1024px+):</span>
                <span className="text-blue-600">Sidebar visible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 p-4 bg-green-100 border border-green-400 rounded-md">
          <p className="text-green-800 font-medium">
            📱 If you can see a proper mobile header with hamburger menu, the fix is working!
          </p>
        </div>
      </div>
    </div>
  );
}
