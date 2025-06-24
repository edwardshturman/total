"use client";

import { authClient } from '@/lib/auth-client';
import React from 'react';

const handleLoginWithGoogle = async () => {
    await authClient.signIn.social({
        provider: "google",
        callbackURL: "/plaid"
    })
    console.log("google")
}

export default function LoginForm() {
    return (
        <div className="login-container">
        <h2>Login</h2>
        <button className="google-button" onClick={handleLoginWithGoogle}>
            <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            />
            Login with Google
        </button>
        </div>
  );
}