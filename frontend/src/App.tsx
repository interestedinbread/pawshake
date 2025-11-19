import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { UploadPage } from './pages/UploadPage';
import { SummaryPage } from './pages/SummaryPage';
import { QAPage } from './pages/QAPage';
import { ClaimFormPage } from './pages/ClaimFormPage';

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route - redirect to home if already authenticated */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/upload"
          element={
            <ProtectedRoute>
              <Layout>
                <UploadPage/>
              </Layout>
            </ProtectedRoute>
          }
          />


        <Route 
          path="/summary"
          element={
            <ProtectedRoute>
              <Layout>
                <SummaryPage />
              </Layout>
            </ProtectedRoute>
          }
          />

        <Route 
          path="/qa"
          element={
            <ProtectedRoute>
              <Layout>
                <QAPage />
              </Layout>
            </ProtectedRoute>
          }
          />

        <Route 
          path="/claims"
          element={
            <ProtectedRoute>
              <Layout>
                <ClaimFormPage />
              </Layout>
            </ProtectedRoute>
          }
          />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
