export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Siden blev ikke fundet</p>
          <a
            href="/dashboard/main"
            className="inline-block bg-[#1AA49A] text-white px-6 py-3 rounded-md hover:bg-[#1AA49A]/90"
          >
            Gå til dashboard
          </a>
        </div>
      </div>
    </div>
  );
} 