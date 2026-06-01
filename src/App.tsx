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
import { Activities } from './pages/Activities';
import { AuthWrapper } from './components/AuthWrapper';
import { CustomDialogs } from './components/CustomDialogs';
import { TripNotificationHandler } from './components/TripNotificationHandler';

export default function App() {
  return (
    <AuthWrapper>
      <AppProvider>
        <HashRouter>
          <CustomDialogs />
          <TripNotificationHandler />
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/notes/*" element={<Notes />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/special" element={<Navigate to="/notes" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </HashRouter>
      </AppProvider>
    </AuthWrapper>
  );
}
