'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ups! Der skete en fejl
              </h2>
              <p className="text-gray-600 mb-8">
                {this.state.error?.message || 'Noget gik galt. Prøv venligst igen.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#1AA49A] text-white px-4 py-2 rounded-md hover:bg-[#1AA49A]/90 transition-colors"
              >
                Genindlæs siden
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 