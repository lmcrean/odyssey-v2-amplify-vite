import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { mockSignIn } from '../../amplify/authentication/signIn';
import { mockSignUp } from '../../amplify/registration/signUp';
import { toast } from 'react-toastify';
import { SignInInput, SignUpInput } from '../../types/auth.types';

export const AuthenticatorForm: React.FC = () => {
  const { route, toSignIn, toSignUp, setAuthStatus, setRoute } = useAuthContext();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (route === 'signUp') {
        const signUpInput: SignUpInput = {
          username: formData.username,
          password: formData.password,
        };
        await mockSignUp(signUpInput);
        setAuthStatus('authenticated');
        setRoute('authenticated');
      } else {
        const signInInput: SignInInput = {
          username: formData.username,
          password: formData.password,
        };
        await mockSignIn(signInInput);
        setAuthStatus('authenticated');
        setRoute('authenticated');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      if (route === 'signUp') {
        toast.error('Failed to create account. Please try again.', { autoClose: 3000 });
      } else {
        toast.error('Failed to sign in. Please try again.', { autoClose: 3000 });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="amplify-authenticator">
      <div className="amplify-tabs" data-testid="authenticator-tabs">
        <div className="amplify-tabs__list" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={route === 'signIn'}
            aria-controls="signIn-panel"
            id="signIn-tab"
            className={`amplify-tabs__item ${route === 'signIn' ? 'amplify-tabs__item--active' : ''}`}
            onClick={toSignIn}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={route === 'signUp'}
            aria-controls="signUp-panel"
            id="signUp-tab"
            className={`amplify-tabs__item ${route === 'signUp' ? 'amplify-tabs__item--active' : ''}`}
            onClick={toSignUp}
          >
            Create Account
          </button>
        </div>

        <div className="amplify-tabs__content">
          <form onSubmit={handleSubmit} data-testid="authenticator-form">
            <div className="amplify-flex">
              <fieldset>
                <div className="amplify-flex amplify-field">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    aria-label="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="amplify-flex amplify-field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    aria-label="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </fieldset>
              <button type="submit" className="amplify-button">
                {route === 'signUp' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 