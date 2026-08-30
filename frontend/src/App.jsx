import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import Home from './pages/Home';
import SearchPage from './pages/Search';
import DiseaseDetail from './pages/DiseaseDetail';
import TargetDetail from './pages/TargetDetail';
import CompoundDetail from './pages/CompoundDetail';
import Analytics from './pages/Analytics';
import References from './pages/References';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Main Home & Search */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />

          {/* Disease Detail (Supporting both singular & plural) */}
          <Route path="/disease/:id" element={<DiseaseDetail />} />
          <Route path="/diseases/:id" element={<DiseaseDetail />} />

          {/* Target Detail (Supporting both singular & plural) */}
          <Route path="/target/:id" element={<TargetDetail />} />
          <Route path="/targets/:id" element={<TargetDetail />} />

          {/* Compound Detail (Supporting both singular & plural) */}
          <Route path="/compound/:id" element={<CompoundDetail />} />
          <Route path="/compounds/:id" element={<CompoundDetail />} />

          {/* Analytics Routes */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/analytics/disease/:id" element={<Analytics />} />
          <Route path="/analytics/target/:id" element={<Analytics />} />

          {/* References */}
          <Route path="/references" element={<References />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}