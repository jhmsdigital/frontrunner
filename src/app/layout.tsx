import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Frontrunner | Social Media Audit',
  description: 'Social media audit tool by Majority Strategies. Analyze your brand presence, understand your competitors, and lead the conversation.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <nav className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-ms-navy font-bold text-white">
                  F
                </div>
                <div className="flex flex-col">
                  <div className="font-bold text-ms-navy text-lg tracking-wide">
                    FRONTRUNNER
                  </div>
                  <div className="text-xs text-ms-gray font-medium">
                    BY MAJORITY STRATEGIES
                  </div>
                </div>
              </div>

              {/* Right side - can add nav items here if needed */}
              <div className="hidden items-center space-x-6 md:flex">
                {/* Navigation items would go here */}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-ms-gray">
              <p>&copy; 2024 Majority Strategies. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
