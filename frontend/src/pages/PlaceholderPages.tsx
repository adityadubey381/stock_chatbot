import { Link } from 'react-router-dom';

const PageWrapper = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div style={{ padding: '2rem', color: 'var(--text-primary)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{title}</h1>
    <div style={{ flex: 1 }}>{children}</div>
    <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'none', marginTop: '2rem' }}>
      &larr; Back to Chat
    </Link>
  </div>
);

export const Billing = () => (
  <PageWrapper title="Billing & Upgrade">
    <p>Select a plan below to upgrade your experience.</p>
    {/* Stripe integration placeholder */}
    <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', maxWidth: '400px' }}>
      <h2>Pro Plan - $20/mo</h2>
      <button className="upgrade-btn" style={{ marginTop: '1rem', width: '100%' }}>Subscribe with Stripe</button>
    </div>
  </PageWrapper>
);

export const Profile = () => (
  <PageWrapper title="User Profile">
    <p>Manage your public and private details.</p>
  </PageWrapper>
);

export const Settings = () => (
  <PageWrapper title="Settings">
    <p>Adjust your account security, passwords, and preferences.</p>
  </PageWrapper>
);

export const Personalization = () => (
  <PageWrapper title="Personalization">
    <p>Choose your theme, chat layout, and accessibility features.</p>
  </PageWrapper>
);

export const Help = () => (
  <PageWrapper title="Help Center">
    <p>Documentation, FAQs, and support contact.</p>
  </PageWrapper>
);

export const Login = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-primary)' }}>
    <div style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '8px', width: '350px', textAlign: 'center' }}>
      <h2>Login</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Sign in to continue</p>
      <Link to="/" className="upgrade-btn" style={{ display: 'inline-block', width: '100%', textDecoration: 'none', textAlign: 'center' }}>Login Demo</Link>
    </div>
  </div>
);
