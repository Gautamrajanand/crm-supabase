export function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-4">
          <div className="h-12 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
        <div className="space-y-4">
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}
