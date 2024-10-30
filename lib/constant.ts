import { TFunction } from "i18next"

export const CharacterType = (t: TFunction<string, undefined>) => {
  return [
    { label: t('home:characterType.man'), value: 'a male' },
    { label: t('home:characterType.woman'), value: 'a female' },
    { label: t('home:characterType.children'), value: 'a kid' },
  ]
}

export const PresetStyle = (t: TFunction<string, undefined>) => {
  return [
    { label: t('home:presetStyle.comic_style'), value: 'Comic Style', image: '/images/Comic Style.png' },
    { label: t('home:presetStyle.line_art_style'), value: 'Line Art Style', image: '/images/Line Art Style.png' },
    { label: t('home:presetStyle.impressionism'), value: 'Impressionism', image: '/images/Impressionism.png' },
    { label: t('home:presetStyle.clay'), value: 'Clay', image: '/images/Clay.png' },
    { label: t('home:presetStyle.watercolor'), value: 'Watercolor', image: '/images/Watercolor.png' },
    { label: t('home:presetStyle.cyberpunk'), value: 'Cyberpunk', image: '/images/Cyberpunk.png' },
    { label: t('home:presetStyle.elf'), value: 'Elf', image: '/images/Elf.png' },
    { label: t('home:presetStyle.clown'), value: 'Clown', image: '/images/Clown.png' },
    { label: t('home:presetStyle.robot'), value: 'Robot', image: '/images/Robot.png' },
    { label: t('home:presetStyle.vampire'), value: 'Vampire', image: '/images/Vampire.png' },
    { label: t('home:presetStyle.zombie'), value: 'Zombie', image: '/images/Zombie.png' },
    { label: t('home:presetStyle.low_poly_style'), value: 'Low Poly Style', image: '/images/Low Poly Style.png' },
  ]
}

export const Tabs = [
  { label: 'tab_preset', value: 1, }, // 预设
  { label: 'tab_custom', value: 2, }, // 自定义
]







