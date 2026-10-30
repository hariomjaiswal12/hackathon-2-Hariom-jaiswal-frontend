import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LandingPage } from './pages/Landing/LandingPage';
import { SignInPage } from './pages/Auth/SignInPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { ExplorePage } from './pages/Explore/ExplorePage';
import { CompanyIntelligencePage } from './pages/Company/CompanyIntelligencePage';
import { CategoryDeepDivePage } from './pages/Category/CategoryDeepDivePage';
import { CareerDNAProfilePage } from './pages/CareerDNA/CareerDNAProfilePage';
import { CareerDNABuilderPage } from './pages/CareerDNA/CareerDNABuilderPage';
import { CareerFitPage } from './pages/CareerFit/CareerFitPage';
import { ComparePage } from './pages/Compare/ComparePage';
import { BattleModePage } from './pages/Compare/BattleModePage';
import { WhatIfSimulatorPage } from './pages/WhatIf/WhatIfSimulatorPage';
import { AskCompanyIQPage } from './pages/AskCompanyIQ/AskCompanyIQPage';
import { ReviewInsightsPage } from './pages/ReviewInsights/ReviewInsightsPage';
import { SavedCompaniesPage } from './pages/Saved/SavedCompaniesPage';
import { SavedComparisonsPage } from './pages/Saved/SavedComparisonsPage';
import { ResearchHistoryPage } from './pages/History/ResearchHistoryPage';
import { DataSourcesPage } from './pages/Sources/DataSourcesPage';
import { AlertsPage } from './pages/Alerts/AlertsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { ComponentSpecimensPage } from './pages/System/ComponentSpecimensPage';

export function App() {
  return (
    <AppProvider>
      <ErrorBoundary fallbackTitle="CompanyIQ Application Error">
        <BrowserRouter>
          <Routes>
          {/* Public Landing Presentation Page (Page 4 in Figma) */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Pages (Pixel-Match to Reference Design) */}
          <Route path="/signin" element={<SignInPage initialMode="login" />} />
          <Route path="/login" element={<SignInPage initialMode="login" />} />
          <Route path="/signup" element={<SignInPage initialMode="register" />} />
          <Route path="/register" element={<SignInPage initialMode="register" />} />

          {/* App Workspace Shell Pages */}
          <Route
            path="/dashboard"
            element={
              <AppShell>
                <DashboardPage />
              </AppShell>
            }
          />

          <Route
            path="/explore"
            element={
              <AppShell>
                <ExplorePage />
              </AppShell>
            }
          />

          <Route
            path="/company/:id"
            element={
              <AppShell>
                <CompanyIntelligencePage />
              </AppShell>
            }
          />

          <Route
            path="/company/:id/category/:categoryKey"
            element={
              <AppShell>
                <CategoryDeepDivePage />
              </AppShell>
            }
          />

          <Route
            path="/career-dna"
            element={
              <AppShell>
                <CareerDNAProfilePage />
              </AppShell>
            }
          />

          <Route
            path="/career-dna/build"
            element={
              <AppShell>
                <CareerDNABuilderPage />
              </AppShell>
            }
          />

          <Route
            path="/career-fit"
            element={
              <AppShell>
                <CareerFitPage />
              </AppShell>
            }
          />

          <Route
            path="/compare"
            element={
              <AppShell>
                <ComparePage />
              </AppShell>
            }
          />

          <Route
            path="/compare/battle"
            element={
              <AppShell>
                <BattleModePage />
              </AppShell>
            }
          />

          <Route
            path="/what-if"
            element={
              <AppShell>
                <WhatIfSimulatorPage />
              </AppShell>
            }
          />

          <Route
            path="/ask"
            element={
              <AppShell>
                <AskCompanyIQPage />
              </AppShell>
            }
          />

          <Route
            path="/review-insights"
            element={
              <AppShell>
                <ReviewInsightsPage />
              </AppShell>
            }
          />

          <Route
            path="/saved"
            element={
              <AppShell>
                <ProtectedRoute
                  title="Saved Companies"
                  description="Sign in or create an account to view and organize your saved company shortlists."
                >
                  <SavedCompaniesPage />
                </ProtectedRoute>
              </AppShell>
            }
          />

          <Route
            path="/saved-comparisons"
            element={
              <AppShell>
                <ProtectedRoute
                  title="Saved Comparisons"
                  description="Sign in or create an account to view and manage your saved multi-company scenarios."
                >
                  <SavedComparisonsPage />
                </ProtectedRoute>
              </AppShell>
            }
          />

          <Route
            path="/history"
            element={
              <AppShell>
                <ProtectedRoute
                  title="Research History"
                  description="Sign in or create an account to view your past company analyses, comparisons, and career fit queries."
                >
                  <ResearchHistoryPage />
                </ProtectedRoute>
              </AppShell>
            }
          />

          <Route
            path="/sources"
            element={
              <AppShell>
                <DataSourcesPage />
              </AppShell>
            }
          />

          <Route
            path="/alerts"
            element={
              <AppShell>
                <AlertsPage />
              </AppShell>
            }
          />

          <Route
            path="/settings"
            element={
              <AppShell>
                <ProtectedRoute
                  title="Account Settings"
                  description="Sign in or create an account to customize your profile, research preferences, and alerts."
                >
                  <SettingsPage />
                </ProtectedRoute>
              </AppShell>
            }
          />

          <Route
            path="/design-system"
            element={
              <AppShell>
                <ComponentSpecimensPage />
              </AppShell>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </AppProvider>
  );
}

export default App;
