import { produce } from 'immer'
import { create } from 'zustand'

import { storeMiddleware } from './middleware'
import { t } from 'i18next';

export interface FormStore {
  presetStyle: {
    value: string;
    image: string;
    label: string
  };
  characterType: string;
  size: {
    value: string;
    width: number;
    height: number;
  };
  url: string;
  tab: number;
}

interface FormActions {
  updateField: <T extends keyof FormStore>(
    field: T,
    value: FormStore[T]
  ) => void
  updateAll: (fields: Partial<FormStore>) => void
  setHasHydrated: (value: boolean) => void
}

export const useFormStore = create<FormStore & FormActions>()(
  storeMiddleware<FormStore & FormActions>(
    (set) => ({
      presetStyle: {
        value: 'Comic Style',
        image: '/images/Comic Style.png',
        label: t('home:presetStyle.comic_style')
      },
      characterType: 'a male',
      size: {
        value: 'default',
        height: 1280,
        width: 960
      },
      url: '',
      tab: 1,
      updateField: (field, value) =>
        set(
          produce((state) => {
            state[field] = value
          })
        ),
      updateAll: (fields) =>
        set(
          produce((state) => {
            for (const [key, value] of Object.entries(fields)) {
              if (typeof value === 'object' && value !== null) {
                // 如果是对象，深层合并
                state[key as keyof FormStore] = {
                  ...state[key as keyof FormStore],
                  ...value,
                };
              } else {
                // 如果是基本类型，直接覆盖
                state[key as keyof FormStore] = value;
              }
            }
          })
        ),
      setHasHydrated: (value) =>
        set(
          produce((state) => {
            state._hasHydrated = value
          })
        ),
    }),
    'user_form_store_config'
  )
)
