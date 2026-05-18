/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Finance } from './pages/Finance';
import { Notes } from './pages/Notes';
import { Docs } from './pages/Docs';
import { Special } from './pages/Special';
import { AuthWrapper } from './components/AuthWrapper';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg border border-red-100">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Waduh, ada masalah!</h2>
        <pre className="text-sm bg-stone-50 p-4 rounded-xl mb-6 overflow-auto text-left max-h-40">
          {error.message}
        </pre>
        <button
          onClick={resetErrorBoundary}
          className="bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-stone-800 transition-all"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthWrapper>
        <AppProvider>
          <HashRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/notes/*" element={<Notes />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/special" element={<Special />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </HashRouter>
        </AppProvider>
      </AuthWrapper>
    </ErrorBoundary>
  );
}
