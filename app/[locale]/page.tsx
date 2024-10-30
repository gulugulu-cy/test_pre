'use client'
import ky from 'ky';
import dayjs from 'dayjs';
import Image from 'next/image';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { emitter } from '@/lib/mitt';
import { Loader2 } from 'lucide-react';
import { TiDelete } from "react-icons/ti";
import Masonry from 'react-layout-masonry';
import { CgSpinner } from "react-icons/cg";
import { GoDownload } from "react-icons/go";
import { CharacterType } from '@/lib/constant';
import { RiUpload2Fill } from "react-icons/ri";
import logo_302 from '@/public/images/logo.png';
import { Button } from '@/components/ui/button';
import { Footer } from '@/app/components/footer';
import { useLogin } from '@/app/hooks/use-login';
import { IoSquareOutline } from "react-icons/io5";
import { useTranslation } from '@/app/i18n/client';
import { useEffect, useRef, useState } from 'react';
import { useFormStore } from '../stores/use-form-store';
import { useUserStore } from '../stores/use-user-store';
import { StyleDialog } from '../components/styleDialog';
import { IoTabletPortraitOutline } from "react-icons/io5";
import { IoTabletLandscapeOutline } from "react-icons/io5";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { MdDeleteOutline, MdOutlineFileDownload } from "react-icons/md";
import { addData, deleteData, getData, IAiAvatarMaker } from '@/lib/api/indexedDB';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const sizeList = [
  { value: 'default', width: 960, height: 1280, icon: ({ className }: { className: string }) => <IoTabletPortraitOutline className={className} /> },
  { value: 'square', width: 1024, height: 1024, icon: ({ className }: { className: string }) => <IoSquareOutline className={className} /> },
  { value: 'wideShape', width: 1280, height: 960, icon: ({ className }: { className: string }) => <IoTabletLandscapeOutline className={className} /> },
]

export default function Home({ params: { locale } }: { params: { locale: string } }) {
  const { t } = useTranslation(locale)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  useLogin(t)

  const [isLoading, setIsLoading] = useState(false);
  const [desktopCss, setDesktopCss] = useState(false);
  const [isGenerate, setIsGenerate] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [dataSource, setDataSource] = useState<IAiAvatarMaker[]>([]);

  const { apiKey, modelName: model } = useUserStore((state) => ({ ...state }))
  const { url, tab, presetStyle, characterType, size, updateAll } = useFormStore((state) => ({ ...state }))

  const handleScroll = () => {
    setDesktopCss(window.scrollY >= 200);
    if ((window.innerHeight + 200) + window.scrollY >= document.documentElement.scrollHeight && !isLoading) {
      onGetData()
    }
  };

  const onGetData = async () => {
    try {
      setIsLoading(true);
      const page = dataSource.length;
      const data = await getData(page);
      setDataSource(() => data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  const handleDownload = (src: string) => {
    if (!src) return;
    ky.get(src)
      .then(response => response.blob()) // 将图片转换为 blob
      .then(blob => {
        const url = window.URL.createObjectURL(blob); // 创建图片的 URL
        const link = document.createElement('a');
        link.href = url;
        link.download = uuidV4(); // 设置文件名为 item.id，也可以根据需求自定义
        document.body.appendChild(link);
        link.click(); // 触发下载
        document.body.removeChild(link); // 移除临时元素
        window.URL.revokeObjectURL(url); // 释放 URL 对象
      })
      .catch(error => {
        toast(t('home:image_download_error'))
      });
  };

  const onUpload = async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (['image/png', 'image/jpg', 'image/jpeg', 'image/webp'].indexOf(file.type) === -1) return;
      setIsUploadLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const imageResult: any = await ky(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/gpt/api/upload/gpt/image`, {
          method: 'POST',
          body: formData,
          timeout: false,
        }).then(res => res.json());
        if (imageResult?.data?.url) {
          updateAll({ url: imageResult.data.url })
        } else {
          toast(t('home:upload_error'));
        }
      } catch (error) {
        toast(t('home:upload_error'));
      }
      setIsUploadLoading(false)
    }
  };

  const onGenerate = async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!url) {
      toast(t('home:face_image_tips'))
      return;
    }
    const content = localStorage.getItem('avatarMakerCustomContent');
    if (tab === 2 && !content) {
      toast(t('home:custom_content.tips'))
      return;
    }
    setIsGenerate(true);
    const routeSrc = tab === 1 ? 'generate' : 'generateCustomStyle';
    let params = {
      model,
      apiKey,
      content,
      characterType,
      width: size.width,
      height: size.height,
      main_face_image: url,
      presetStyle: presetStyle.value
    }
    try {
      const response = await ky(`/api/${routeSrc}`, {
        method: 'post',
        body: JSON.stringify(params),
        timeout: false,
      })
      const result: any = await response.json();
      if (result?.output) {
        const url = JSON.parse(result.output)[0];
        const data = await addData({ url, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
        setDataSource((v) => [{ ...data }, ...v])
        toast(result?.message || t('home:generate.success'))
      }
      if (result?.error || !result?.output) {
        if (result?.error?.err_code) {
          emitter.emit('ToastError', result?.error?.err_code || '')
        } else {
          toast(result?.message || t('home:generate.error'))
        }
      }
      setIsGenerate(false);
    } catch (error: any) {
      toast(error?.message || t('home:generate.error'))
      setIsGenerate(false);
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const SizeCom = () => (
    <div>
      <div className='mb-1 text-sm'>{t('home:size')}</div>
      <div className='flex items-center justify-between flex-wrap'>
        {
          sizeList.map(({ value, width, height, icon: Icon }) => (
            <div key={value} className='group cursor-pointer' onClick={() => { updateAll({ size: { value, width, height } }) }}>
              <div className={
                `border-2 rounded-sm p-1 flex justify-center transition-all
                group-hover:border-[hsl(var(--primary))] group-hover:bg-[#e8d0f3]
                ${size.value === value && 'border-[hsl(var(--primary))] bg-[#e8d0f3]'}`
              }>
                <Icon className={`h-9 w-9 group-hover:text-[#a960ef] ${size.value === value && 'text-[#a960ef]'}  `} />
              </div>
              <div className={`text-sm mt-1 group-hover:text-[hsl(var(--primary))] ${size.value === value && 'text-[hsl(var(--primary))]'}`}>
                {width} × {height}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )

  const SelectCharacterType = () => (
    <div>
      <div className='mb-1 text-sm'>{t('home:characterType.tips')}</div>
      <Select value={characterType} onValueChange={(value) => updateAll({ characterType: value })}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {CharacterType(t).map(item => (<SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>))}
          </SelectGroup>

        </SelectContent>
      </Select>
    </div>
  )

  const onDeleteDialog = (item: IAiAvatarMaker) => {
    const onDel = async (e: { stopPropagation: () => void; }) => {
      e.stopPropagation();
      try {
        await deleteData(item.id || 0)
        await onGetData();
        toast(t('home:delete_success'))
      } catch (error) {
        toast(t('home:delete_error'))
      }
    }
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div className='p-1'>
            <MdDeleteOutline className='text-red-600 md:text-xl text-2xl' />
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('home:delete_data_tips')}</AlertDialogTitle>
            <AlertDialogDescription />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('home:cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onDel}>{t('home:continue')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onGetData()
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll); // 清除事件监听
    };
  }, [dataSource.length, isLoading]);

  return (
    <div className='relative' >
      <div className='my-0 mx-auto w-full md:max-w-[1200px] '>
        <div className='flex items-center w-full justify-center py-10'>
          <Image alt='ai-302-logo' src={logo_302} quality={100} height={65} width={65} draggable={false} />
          <div className='text-2xl ml-5 font-bold'>{t('home:title')}</div>
        </div>
        {/* 主UI */}
        <div className='flex w-full h-full px-5 md:flex-row flex-col'>
          {/* 制作工具 */}
          <div className={`md:w-[300px] w-full flex flex-col gap-5 mx-auto md:mb-0 mb-5 md:pr-5 ${desktopCss && 'md:h-screen md:sticky md:top-5 md:overflow-y-auto md:pb-10'} `}>
            <div
              className={`${!url && 'border-dashed'} border  border-[hsl(var(--background-reverse))] rounded-xl min-h-[240px] max-h-[240px] h-full cursor-pointer relative overflow-hidden flex flex-col items-center justify-center`}
              onClick={() => fileInputRef?.current?.click()}
              onDragLeave={(e) => { e.preventDefault() }}
              onDragOver={(e) => { e.preventDefault() }}
              onDrop={handleDrop}
            >
              <input disabled={isUploadLoading} type="file" accept=".jpg, .jpeg, .png, .webp" style={{ display: 'none' }} ref={fileInputRef} onChange={(e) => onUpload(e.target.files)} />
              {url && <TiDelete className='absolute right-1 top-1 text-red-500 text-2xl cursor-pointer' onClick={(e) => { e.stopPropagation(); updateAll({ url: '' }) }} />}
              {url && <img src={url} alt="" className='max-h-[240px] object-contain' />}
              {
                isUploadLoading &&
                <div className='absolute left-0 top-0 flex flex-col justify-center items-center w-full h-full bg-[hsl(var(--background-backdrop))] backdrop-blur-sm rounded-xl'>
                  <CgSpinner className='animate-spin text-5xl text-[#7c3aed] mb-2' />
                  <span className='text-sm text-[hsl(var(--background-reverse))]'>{t('home:isUploadLoading')}</span>
                </div>
              }
              {
                (!url && !isUploadLoading) &&
                <>
                  <RiUpload2Fill className='text-5xl mb-5' />
                  <span className='text-sm text-slate-500'>{t('home:drag_image')}</span>
                  <span className='text-sm text-slate-500'>{t('home:click_image')}</span>
                </>
              }
            </div>
            <StyleDialog onUpdateData={() => onGetData()} />
            <SelectCharacterType />
            <SizeCom />
            <Button className='w-full' disabled={isGenerate} onClick={onGenerate}>
              {t('home:but_make')}
              {isGenerate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            </Button>
          </div>
          <div className='w-[1px] bg-[hsl(var(--background-reverse))] md:block hidden'></div>
          {/* 历史记录 */}
          <div className='flex-1 h-full md:pl-5' style={{ minHeight: 'calc(100vh - 145px - 60px)' }}>
            {
              dataSource.length ?
                <PhotoProvider maskOpacity={0.8} loop={true} toolbarRender={({ images, index }) => {
                  return (
                    <div className='flex items-center gap-3'>
                      <GoDownload className='text-2xl opacity-75 cursor-pointer hover:opacity-100 transition-all' onClick={() => { handleDownload(images[index]?.src || '') }} />
                    </div>
                  );
                }}>
                  <Masonry columns={{ 640: 1, 768: 2, 1024: 3, 1280: 5 }} gap={10}>
                    {
                      dataSource.map(item => (
                        <PhotoView src={item.url} key={item.id}>
                          <div className={`relative cursor-pointer group overflow-hidden`}>
                            <div className='w-full absolute left-0 top-[-28px] justify-between flex items-center group-hover:top-0 bg-[#ffffff8a] backdrop-blur-sm transition-all'>
                              <div className='p-1'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(item.url)
                                }}
                              >
                                <MdOutlineFileDownload className='md:text-xl text-2xl text-[#7c3aed]' />
                              </div>
                              <div onClick={(e) => { e.stopPropagation() }}>
                                {onDeleteDialog(item)}
                              </div>
                            </div>
                            <img src={item.url} className='cursor-pointer rounded-sm w-full border' />
                          </div>
                        </PhotoView>
                      ))
                    }
                  </Masonry>
                </PhotoProvider> : <></>
            }
            {
              !dataSource.length && (
                <div className={`flex flex-1 justify-center flex-col items-center gap-6 h-full`} style={{ height: 'calc(100vh - 145px - 60px)' }}>
                  <img className='h-[400px]' src="/images/empty.png" alt="" />
                  <div className='md:text-3xl text-2xl text-slate-400'>{t('home:empty_text')}</div>
                </div>
              )
            }
          </div>
        </div>
      </div>
      <Footer className='py-3' />
    </div >
  )
}