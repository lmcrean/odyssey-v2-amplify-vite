import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { mockSignIn } from '../../amplify/authentication/signIn';
import { mockSignUp } from '../../amplify/registration/signUp';

export const AuthenticatorForm: React.FC = () => {
  const { route, toSignIn, toSignUp, setAuthStatus } = useAuthContext();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (route === 'signUp') {
        await mockSignUp({
          username: formData.username,
          password: formData.password,
        });
        setAuthStatus('authenticated');
      } else {
        await mockSignIn({
          username: formData.username,
          password: formData.password,
        });
        setAuthStatus('authenticated');
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="amplify-tabs">
      <div className="amplify-tabs__list amplify-tabs__list--top amplify-tabs__list--equal" role="tablist">
        <button
          role="tab"
          aria-selected={route === 'signIn'}
          className={`amplify-tabs__item ${route === 'signIn' ? 'amplify-tabs__item--active' : ''}`}
          onClick={toSignIn}
        >
          Sign In
        </button>
        <button
          role="tab"
          aria-selected={route === 'signUp'}
          className={`amplify-tabs__item ${route === 'signUp' ? 'amplify-tabs__item--active' : ''}`}
          onClick={toSignUp}
        >
          Create Account
        </button>
      </div>
      <div className="amplify-tabs__panel amplify-tabs__panel--active" role="tabpanel">
        <form data-amplify-form="" onSubmit={handleSubmit}>
          <div className="amplify-flex">
            <fieldset className="amplify-flex">
              <div className="amplify-flex amplify-field amplify-textfield">
                <label className="amplify-label" htmlFor="username">
                  Username
                </label>
                <input
                  aria-label="Username"
                  className="amplify-input"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="amplify-flex amplify-field amplify-textfield">
                <label className="amplify-label" htmlFor="password">
                  Password
                </label>
                <input
                  aria-label="Password"
                  className="amplify-input"
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </fieldset>
            <button
              className="amplify-button"
              role="button"
              aria-label={route === 'signUp' ? 'Sign Up' : 'Sign In'}
            >
              {route === 'signUp' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 