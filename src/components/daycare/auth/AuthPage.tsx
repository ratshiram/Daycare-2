
import React, { useState } from 'react';
import { InputField } from '../ui/InputField';
import { Icons } from '@/components/Icons';

interface AuthPageProps {
    onSignUp: (email: string, password: string) => void;
    onSignIn: (email: string, password: string) => void;
    loading: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSignUp, onSignIn, loading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningUp, setIsSigningUp] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            alert("Email and password are required.");
            return;
        }
        if (isSigningUp) {
            onSignUp(email, password);
        } else {
            onSignIn(email, password);
        }
    };

    return (
        <div className="auth-page-container flex items-center justify-center min-h-screen p-4 bg-background">
            <div className="auth-card w-full max-w-md p-8 bg-card rounded-xl shadow-2xl border">
                <div className="auth-logo-wrapper text-center mb-6">
                    <img
                        src="/logo.png"
                        data-ai-hint="evergreen tree logo"
                        alt="Evergreen Tots App Logo"
                        className="auth-logo-image inline-block"
                        style={{ height: '50px' }}
                    />
                </div>
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground">{isSigningUp ? 'Create Your Account' : 'Welcome Back'}</h1>
                    <p className="text-muted-foreground mt-2">{isSigningUp ? 'Join our daycare community today.' : 'Sign in to manage your daycare activities.'}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField label="Email Address" id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" icon={Icons.Mail} />
                    <div className="input-group">
                        <label htmlFor="password" className="input-label">Password</label>
                        <div className="input-wrapper input-wrapper-password">
                            <Icons.Lock className="input-icon" size={18} />
                            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={isSigningUp ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field input-field-with-icon pr-10" placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-button absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground" title={showPassword ? "Hide password" : "Show password"}>
                                {showPassword ? <Icons.EyeOff size={20} /> : <Icons.Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary btn-full-width">
                        {loading ? <Icons.Clock size={20} className="animate-spin-css" /> : isSigningUp ? <Icons.UserPlus size={20} /> : <Icons.LogIn size={20} />}
                        <span style={{ marginLeft: '8px' }}>{loading ? 'Processing...' : isSigningUp ? 'Sign Up' : 'Sign In'}</span>
                    </button>
                </form>
                <p className="auth-toggle-text text-center text-sm text-muted-foreground mt-6">
                    {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button onClick={() => setIsSigningUp(!isSigningUp)} className="auth-toggle-link font-medium text-primary hover:underline">
                        {isSigningUp ? 'Sign In Here' : 'Create an Account'}
                    </button>
                </p>
            </div>
        </div>
    );
};
