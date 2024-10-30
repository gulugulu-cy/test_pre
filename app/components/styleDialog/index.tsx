import ky from "ky";
import dayjs from "dayjs";
import { t } from "i18next";
import toast from "react-hot-toast";
import { emitter } from "@/lib/mitt";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { addData } from '@/lib/api/indexedDB';
import { Button } from "@/components/ui/button";
import { PresetStyle, Tabs } from "@/lib/constant";
import { Textarea } from "@/components/ui/textarea";
import { useFormStore } from "@/app/stores/use-form-store";
import { useUserStore } from "@/app/stores/use-user-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";

export function StyleDialog(props: { onUpdateData: () => void }) {
  const { apiKey, modelName: model } = useUserStore((state) => ({ ...state }))
  const { presetStyle, size, tab, url, characterType, updateAll } = useFormStore((state) => ({ ...state }))

  const [tabIndex, setTabIndex] = useState(1);
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [isGenerate, setIsGenerate] = useState(false);
  const [selectStyle, setSelectStyle] = useState({ label: t('home:presetStyle.comic_style'), value: 'Comic Style', image: '/images/Comic Style.png' });

  const onSubmit = async () => {
    if (tabIndex === 2) {
      if (!url) {
        toast(t('home:face_image_tips'))
        return;
      }
      try {
        let params = {
          model,
          apiKey,
          content,
          characterType,
          width: size.width,
          height: size.height,
          main_face_image: url,
        }
        setIsGenerate(true);
        const response = await ky('/api/generateCustomStyle', {
          method: 'post',
          body: JSON.stringify(params),
          timeout: false
        });
        const result: any = await response.json();
        if (result?.output) {
          const url = JSON.parse(result.output)[0];
          await addData({ url, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
          toast(result?.message || t('home:generate.success'))
          props.onUpdateData();
          updateAll({ presetStyle: { value: 'custom', label: t('home:presetStyle.custom'), image: '/images/custom.png' }, tab: tabIndex })
          setIsGenerate(false);
        }
        if (result?.error || !result?.output) {
          if (result?.error?.err_code) {
            emitter.emit('ToastError', result?.error?.err_code || '')
          } else {
            toast(result?.message || t('home:generate.error'))
          }
          setIsGenerate(false);
          return;
        }
      } catch (error) {
        toast(t('home:generate.error'))
        setIsGenerate(false);
        return;
      }
    } else {
      updateAll({ presetStyle: { ...selectStyle }, tab: tabIndex })
    }
    window.localStorage.setItem('presetStyle', JSON.stringify(selectStyle))
    setOpen(false);
  }

  useEffect(() => {
    const data = window.localStorage.getItem('avatarMakerCustomContent')
    if (data) {
      setContent(data)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setTabIndex(tab);
      setSelectStyle(presetStyle)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(value) => { if (isGenerate) return; setOpen(value) }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-[65px] w-full gap-5 relative bg-[hsl(var(--background))]">
          <img className="h-[80%] absolute left-2" src={presetStyle.image} />
          <span className="text-lg font-bold">{presetStyle.label}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[70vw]">
        <DialogHeader>
          <DialogTitle>{t('home:styleDialog.choose_style')}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="w-full flex gap-5 items-center">
          {
            Tabs.map(item => (
              <div key={item.value}
                onClick={() => { if (isGenerate) return; setTabIndex(item.value) }}
                className={`
									cursor-pointer border-b-2 pb-1 px-5
									border-[${tabIndex === item.value ? 'hsl(var(--primary))' : '#fff'}]
									${tabIndex === item.value && "text-[hsl(var(--primary))]"}
								`}
              >
                {t(`home:styleDialog.${item.label}`)}
              </div>
            ))
          }
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-2">
          {tabIndex == 1 ?
            <div className="grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 mm:grid-cols-2 grid-cols-1 gap-5">
              {PresetStyle(t).map(item => (
                <div
                  key={item.value}
                  className={`
									transition-all
									overflow-hidden rounded-lg border cursor-pointer group
									hover:border-[hsl(var(--primary))] hover:shadow-custom-purple
									${selectStyle.value === item.value && "shadow-custom-purple border-[hsl(var(--primary))]"}
								`}
                  onClick={() => { setSelectStyle({ ...item }) }}
                >
                  <img src={`/images/${item.value}.png`} />
                  <div className={`
										p-2 border-t text-sm
										group-hover:text-[hsl(var(--primary))]
										group-hover:border-[hsl(var(--primary))]
										${selectStyle.value === item.value && "text-[hsl(var(--primary))] border-[hsl(var(--primary))]"}
									`}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div> :
            <div>
              <div className="text-sm pb-4 text-[hsl(var(--primary))]">{t('home:styleDialog.tab_custom_tips')}</div>
              <Textarea
                placeholder={t('home:styleDialog.custom_input_placeholder')}
                rows={20}
                value={content}
                disabled={isGenerate}
                onChange={(e) => {
                  window.localStorage.setItem('avatarMakerCustomContent', e.target.value)
                  setContent(e.target.value)
                }}
              />
            </div>
          }
        </div>
        <DialogFooter>
          <Button disabled={tabIndex == 2 && (!content.trim() || isGenerate)} onClick={() => onSubmit()}>
            {t('home:styleDialog.submit')}
            {isGenerate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
