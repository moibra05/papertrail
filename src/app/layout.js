import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import UserProvider from "../providers/UserProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PaperTrail",
  description: "A receipt tracker for the modern age.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://kit.fontawesome.com/085e09a5e6.js"
          crossOrigin="anonymous"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                      (function(){
                        try{
                          var stored = localStorage.getItem('theme');
                          if(stored === 'dark') document.documentElement.classList.add('dark');
                          else if(stored === 'light') document.documentElement.classList.remove('dark');
                          else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
                        }catch(e){}
                      })();
                    `,
          }}
        />
      </head>
      <body
        className={`flex flex-col min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          {children}
          <Toaster position="top-right" richColors />
        </UserProvider>
      </body>
    </html>
  );
}
