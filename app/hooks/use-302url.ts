import { useUserStore } from '@/app/stores/use-user-store'
import { env } from 'next-runtime-env'

export function use302Url() {
  const { region } = useUserStore((state) => ({ region: state.region }))

  return {
    href:
      region == '0'
        ? `${process.env.NEXT_PUBLIC_OFFICIAL_WEBSITE_URL_CHINA}`
        : `${process.env.NEXT_PUBLIC_OFFICIAL_WEBSITE_URL_GLOBAL}`
  }
}
