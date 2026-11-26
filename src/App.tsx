import { FilePlus2, LayoutDashboard } from 'lucide-react';
import { Component, lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DashboardLayout, RequireRole, type NavGroup } from '@/components/layout/DashboardLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageLoader } from '@/components/ui/Feedback';
import { ConfirmProvider } from '@/components/ui/Modal';
import { AuthProvider } from '@/context/AuthContext';
import { SiteProvider } from '@/context/SiteContext';
import { ToastProvider } from '@/context/ToastContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = (f: () => Promise<any>, name: string) => lazy<ComponentType<any>>(() => f().then((m) => ({ default: m[name] })));

// Public pages
const Home = p(() => import('@/pages/public/Home'), 'HomePage');
const Services = p(() => import('@/pages/public/Services'), 'ServicesPage');
const ServiceDetail = p(() => import('@/pages/public/ServiceDetail'), 'ServiceDetailPage');
const About = p(() => import('@/pages/public/About'), 'AboutPage');
const Contact = p(() => import('@/pages/public/Contact'), 'ContactPage');
const NotFound = p(() => import('@/pages/public/NotFound'), 'NotFoundPage');

// Auth pages


// User role pages
const UserDashboard = p(() => import('@/pages/user/UserDashboard'), 'UserDashboard');
const NewRequest = p(() => import('@/pages/user/NewRequest'), 'NewRequestPage');

const userNav: NavGroup[] = [
  {
    items: [
      { to: '/dashboard', label: 'My Submissions', icon: LayoutDashboard, end: true },
      { to: '/dashboard/new-order', label: 'Submit Print Request', icon: FilePlus2 },
    ],
  },
];

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error('[ui] render error', error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink-900 px-6 text-center text-white">
        <h1 className="display text-4xl">Something went wrong</h1>
        <p className="max-w-md text-ink-300">Reload the page to continue.</p>
        <button onClick={() => window.location.reload()} className="rounded-xl bg-brand-500 px-5 py-3 font-semibold">
          Reload page
        </button>
      </div>
    );
  }
}

export function App() {
  return (
    <AppErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <SiteProvider>
            <ConfirmProvider>
              <Suspense fallback={<PageLoader dark />}>
                <Routes>
                  <Route element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="services" element={<Services />} />
                    <Route path="services/:slug" element={<ServiceDetail />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>



                  <Route element={<RequireRole role="user" />}>
                    <Route path="dashboard" element={<DashboardLayout nav={userNav} variant="user" />}>
                      <Route index element={<UserDashboard />} />
                      <Route path="new-order" element={<NewRequest />} />
                      <Route path="*" element={<NotFound dashboard />} />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </ConfirmProvider>
          </SiteProvider>
        </AuthProvider>
      </ToastProvider>
    </AppErrorBoundary>
  );
}
