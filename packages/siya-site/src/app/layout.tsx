import './globals.css';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

type Nodes = { children: ReactNode | ReactNode[] };

export default function RootLayout({ children }: Nodes) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="description"
          content="Siya is a Slack app that helps teams run asynchronous stand-ups and track their progress."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Siya (Bot)</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <nav className="bg-siya-blue border-siya-yellow z-50 flex flex-wrap items-center justify-between border-b-4 px-4 py-2 drop-shadow-2xl sm:px-8 sm:py-2 md:px-16 md:py-4">
          <Link href={`/`}>
            <div className="flex flex-shrink-0 items-center gap-2 text-white">
              <div className="h-12 w-12 md:h-24 md:w-24">
                <Image src="/siya_icon.png" alt="Siya" width="92" height="92" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold tracking-tight md:text-4xl">
                  SIYA
                </span>
                <span className="text-sm text-gray-300">
                  Stand-up Insights & Your Analytics
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden md:block">
            <div className="m-2 flex flex-shrink-0 items-center gap-10 text-white">
              <div className="flex items-center gap-8">
                <Link className="hover:text-siya-yellow" href={`/`}>
                  Home
                </Link>
                <Link className="hover:text-siya-yellow" href={`/features`}>
                  Features
                </Link>
                <a
                  className="hover:text-siya-yellow"
                  target={`_blank`}
                  href={`https://bhavinkamani.freshdesk.com/`}>
                  Support
                </a>
              </div>
              <div className="flex items-center hover:opacity-75">
                <a href="https://slack.com/oauth/v2/authorize?client_id=4975212221364.4975287333588&scope=app_mentions:read,channels:join,channels:read,chat:write,chat:write.customize,chat:write.public,commands,groups:read,im:read,incoming-webhook,mpim:read,team:read,users:read,users:read.email,im:history&user_scope=">
                  <img
                    alt="Siya - Add to Slack"
                    src="https://platform.slack-edge.com/img/add_to_slack.png"
                    srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                  />
                </a>
              </div>
            </div>
          </div>
        </nav>
        <div className="z-10">{children}</div>
        <footer className="lg:pd-16 bg-siya-blue flex flex-col-reverse items-start justify-evenly gap-8 p-6 text-white md:flex-row md:gap-4 md:p-12">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center gap-4">
              <Image src="/siya_icon.png" alt="Siya" width="48" height="48" />
              <span className="text-2xl font-semibold tracking-tight">
                SIYA
              </span>
            </div>
            <p className="text-sm text-gray-300">
              Siya is a bot that runs your asynchronous stand-up meetings.
            </p>
            <div className="flex flex-col items-start justify-center gap-2 md:pt-16 lg:pt-24">
              <span className="text-sm text-gray-300">
                © 2022 - {new Date().getFullYear()} | Bhavin Kamani - All rights
                reserved.
              </span>
              <span className="text-sm text-gray-300">
                Made with ❤️ in India.
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="border-siya-yellow border-b text-xl font-semibold tracking-tight">
              Quick Links
            </span>
            <Link className="hover:text-siya-yellow text-gray-300" href={`/`}>
              Home
            </Link>
            <Link
              className="hover:text-siya-yellow text-gray-300"
              href={`/features`}>
              Features
            </Link>
            <a
              className="hover:text-siya-yellow"
              target={`_blank`}
              href={`https://bhavinkamani.freshdesk.com/`}>
              Support
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="border-siya-yellow border-b text-xl font-semibold tracking-tight">
              Utility Links
            </span>
            <Link
              className="hover:text-siya-yellow text-gray-300"
              href={`/privacy-policy`}>
              Privacy Policy
            </Link>
            <Link
              className="hover:text-siya-yellow text-gray-300"
              href={`/terms-of-service`}>
              Terms of Service
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="border-siya-yellow border-b text-xl font-semibold tracking-tight">
              Contact Us
            </span>
            <a
              className="hover:text-siya-yellow text-gray-300"
              href="mailto:hey@bhavinkamani.com">
              hey@bhavinkamani.com
            </a>
            <a
              className="hover:text-siya-yellow text-gray-300"
              href="tel:+917775866123">
              +91 77758 66123
            </a>
            <Image
              src="/bmc_qr.png"
              alt="By me a coffee"
              width="160"
              height="160"
            />
          </div>
        </footer>
      </body>
    </html>
  );
}
