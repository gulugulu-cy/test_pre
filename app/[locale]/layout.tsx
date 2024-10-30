import '@/lib/check-env'
import { logger } from '@/lib/logger'
import { env, PublicEnvScript } from 'next-runtime-env'
import '../globals.css'
import ClientOnly from '@/app/components/client-only'
import { ErrorHandler } from '@/app/components/error-handler'
import { languages } from '@/app/i18n/settings'
import { dir } from 'i18next'
import { Metadata, ResolvingMetadata } from 'next'
import { headers } from 'next/headers'
import { Toaster } from 'react-hot-toast'
import { Providers } from '../components/providers'
import { Toolbar } from '../components/toolbar'
import 'react-photo-view/dist/react-photo-view.css';
import { detectLocale } from '@/lib/utils'
export async function generateStaticParams() {
  return languages.map((locale) => ({ locale }))
}
type Props = {
  params: { locale: string }
  searchParams: { [key: string]: string | string[] | undefined }
}
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const headers_ = headers();
  const hostname = headers_.get("host");

  const previousImages = (await parent).openGraph?.images || [];

  const info = {
    zh: {
      title: "AI 头像制作",
      description: "生成不同风格的自拍头像",
      image: "/images/headshot_cn_tool_logo.png",
    },
    en: {
      title: "AI Avatar Maker",
      description: "Generate selfies with different styles",
      image: "/images/headshot_en_tool_logo.png",
    },
    ja: {
      title: "AIアバター作成",
      description:"様々なスタイルの自撮りアイコンを生成します",
      image: "/images/headshot_jp_tool_logo.png",
    },
  };

  let locale = detectLocale(
    (searchParams && (searchParams.lang as string)) || params.locale || "en"
  ) as keyof typeof info;

  if (!(locale in info)) {
    locale = "en";
  }

  return {
    title: info[locale as keyof typeof info].title,
    description: info[locale as keyof typeof info].description,
    metadataBase: new URL(
      (hostname as string).includes("localhost")
        ? "http://localhost:3000"
        : `https://${hostname}`
    ),
    alternates: {
      canonical: `/${locale}`,
      languages: languages
        .filter((item) => item !== locale)
        .map((item) => ({
          [item]: `/${item}`,
        }))
        .reduce((acc, curr) => Object.assign(acc, curr), {}),
    },
    openGraph: {
      url: `/${locale}`,
      images: [info[locale as keyof typeof info].image, ...previousImages],
    },
    twitter: {
      site: (hostname as string).includes("localhost")
        ? `http://localhost:3000/${locale}`
        : `https://${hostname}/${locale}`,
      images: [info[locale as keyof typeof info].image, ...previousImages],
    },
  };
}
export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode
  params: { locale: string }
}>) {
  return (
    <html lang={locale} dir={dir(locale)}>
      <head>
        <PublicEnvScript />
      </head>
      <body>
        <ClientOnly>
          <Providers>
            <Toaster />
            <ErrorHandler />
            <Toolbar />
            {children}
            <script
              src='https://assets.salesmartly.com/js/project_177_61_1649762323.js'
              async
            />
          </Providers>
        </ClientOnly>
      </body>
    </html>
  )
}