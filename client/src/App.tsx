import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Components
import Homepage from './pages/Homepage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import AdDetail from './pages/AdDetail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ads/:id" element={<AdDetail />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole={['ADMIN', 'MODERATOR']}>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback routes */}
            <Route 
              path="/unauthorized" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Yetkisiz Erişim</h2>
                    <p className="text-gray-600 mb-4">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
                    <a href="/" className="text-blue-600 hover:text-blue-500">Ana sayfaya dön</a>
                  </div>
                </div>
              } 
            />
            
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Sayfa Bulunamadı</h2>
                    <p className="text-gray-600 mb-4">Aradığınız sayfa mevcut değil.</p>
                    <a href="/" className="text-blue-600 hover:text-blue-500">Ana sayfaya dön</a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
