import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Frontrunner | Social Media Audit by Majority Strategies',
  description: 'Social media audit tool by Majority Strategies. Analyze your brand presence, understand your competitors, and lead the conversation.',
  icons: {
    icon: '/MS_icon_rgb.png',
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
        <nav className="bg-ms-navy shadow-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              {/* MS Logo + Frontrunner */}
              <div className="flex items-center gap-5">
                <img
                  src="/MS_logo_white.png"
                  alt="Majority Strategies"
                  className="h-10 w-auto"
                />
                <div className="h-8 w-px bg-white/30"></div>
                <div className="flex flex-col">
                  <div className="font-extrabold text-white text-lg tracking-widest leading-tight">
                    FRONTRUNNER
                  </div>
                  <div className="text-[10px] text-ms-skyBlue font-medium tracking-wider uppercase">
                    Social Media Audit Tool
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="hidden items-center space-x-4 md:flex">
                <span className="text-xs text-white/60 font-medium">
                  Powered by Majority Strategies
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-ms-navy mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src="/MS_logo_white.png"
                  alt="Majority Strategies"
                  className="h-8 w-auto opacity-80"
                />
                <div className="h-6 w-px bg-white/20"></div>
                <span className="text-sm text-white/60 font-medium">
                  Frontrunner by Majority Strategies
                </span>
              </div>
              <div className="text-center text-xs text-white/40">
                <p>&copy; {new Date().getFullYear()} Majority Strategies. All rights reserved. | 904-567-2008 | MajorityStrategies.com</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
