import Link from 'next/link'
import { FileText, Plus, BarChart3, ExternalLink } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Trip Forms
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create beautiful forms to collect participant responses for your trips
          </p>
        </div>

        {/* Quick Access to Default Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <Link
            href="/f/default-trip-form"
            className="block bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <ExternalLink className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Fill Out Trip Survey</h2>
            </div>
            <p className="text-primary-100 text-lg">
              Click here to fill out the trip preferences survey
            </p>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Link
            href="/create"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-primary-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 rounded-full p-6 mb-6 group-hover:bg-primary-500 transition-colors duration-300">
                <Plus className="w-12 h-12 text-primary-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Create Form
              </h2>
              <p className="text-gray-600">
                Build a new form with custom questions and field types
              </p>
            </div>
          </Link>

          <Link
            href="/forms"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-primary-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 rounded-full p-6 mb-6 group-hover:bg-primary-500 transition-colors duration-300">
                <FileText className="w-12 h-12 text-primary-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                My Forms
              </h2>
              <p className="text-gray-600">
                View and manage all your created forms
              </p>
            </div>
          </Link>

          <Link
            href="/responses/auth"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-primary-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 rounded-full p-6 mb-6 group-hover:bg-primary-500 transition-colors duration-300">
                <BarChart3 className="w-12 h-12 text-primary-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                View Responses
              </h2>
              <p className="text-gray-600">
                Analyze responses collected from your forms
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}

