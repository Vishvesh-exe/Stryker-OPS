/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider, useAppStore } from './store';
import Login from './components/Login';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import FanDashboard from './components/FanDashboard';
import SecurityDashboard from './components/SecurityDashboard';

function MainApp() {
  const { user } = useAppStore();

  if (!user) return <Login />;

  return (
    <Layout>
      {user.role === 'admin' ? <AdminDashboard /> : user.role === 'security' ? <SecurityDashboard /> : <FanDashboard />}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
