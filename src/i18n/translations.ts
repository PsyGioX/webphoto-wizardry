/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import type { FilterId } from '@/lib/filters';

export type Lang = 'en' | 'ru';

export type FeatureIcon = 'shield' | 'crop' | 'wand' | 'sliders' | 'undo' | 'smartphone';

export interface Messages {
  meta: { title: string; description: string };
  common: { close: string; cancel: string; apply: string };
  nav: {
    open: string;
    export: string;
    language: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    skip: string;
    home: string;
  };
  hero: { title: string; subtitle: string; privacy: string };
  drop: { title: string; hint: string; choose: string; sample: string; release: string; aria: string };
  tabs: { tools: string; adjust: string; filters: string };
  tools: {
    transform: string;
    rotateLeft: string;
    rotateRight: string;
    flipH: string;
    flipV: string;
    crop: string;
    resize: string;
    removeBg: string;
    reset: string;
  };
  crop: { hint: string; free: string; apply: string; cancel: string; ratio: string; size: (w: number, h: number) => string };
  bg: { title: string; tolerance: string; run: string; running: string; hint: string };
  adjust: { brightness: string; contrast: string; saturation: string; hue: string; reset: string };
  filters: Record<FilterId, string>;
  stage: { undo: string; redo: string; compare: string; size: (w: number, h: number) => string; busy: string };
  resize: {
    title: string;
    description: string;
    width: string;
    height: string;
    keep: string;
    quick: string;
    limit: (mp: number, side: number) => string;
  };
  export: {
    title: string;
    description: string;
    format: string;
    quality: string;
    filename: string;
    size: string;
    download: string;
    working: string;
    png: string;
    jpeg: string;
    webp: string;
  };
  toast: {
    loaded: string;
    notImage: string;
    loadFail: string;
    tooLarge: string;
    downscaled: (w: number, h: number) => string;
    cropped: (w: number, h: number) => string;
    resized: (w: number, h: number) => string;
    bgDone: (percent: number) => string;
    bgNothing: string;
    bgTooMuch: string;
    bgFail: string;
    exported: (name: string) => string;
    exportFail: string;
    formatUnsupported: string;
  };
  footer: { privacy: string; source: string; rights: string };
  content: {
    featuresTitle: string;
    features: { icon: FeatureIcon; title: string; text: string }[];
    stepsTitle: string;
    steps: { title: string; text: string }[];
    faqTitle: string;
    faq: { q: string; a: string }[];
  };
}

const en: Messages = {
  meta: {
    title: 'PhotoWizard: free private photo editor in your browser',
    description:
      'Crop, rotate, resize, remove plain backgrounds and add filters to your photos. PhotoWizard runs on your device, so nothing is uploaded. Free, no sign-up.',
  },
  common: { close: 'Close', cancel: 'Cancel', apply: 'Apply' },
  nav: {
    open: 'Open photo',
    export: 'Export',
    language: 'Switch language',
    themeLight: 'Switch to light theme',
    themeDark: 'Switch to dark theme',
    themeSystem: 'Use system theme',
    skip: 'Skip to content',
    home: 'PhotoWizard home',
  },
  hero: {
    title: 'Edit photos in your browser. Nothing gets uploaded.',
    subtitle:
      'Crop, rotate, resize, remove plain backgrounds and add filters. PhotoWizard works entirely on your device, so your pictures stay private.',
    privacy: 'Free, no account, no watermark',
  },
  drop: {
    title: 'Drop a photo here',
    hint: 'JPG, PNG, WebP or GIF. You can also paste an image with Ctrl+V.',
    choose: 'Choose photo',
    sample: 'Try a sample',
    release: 'Release to open this photo',
    aria: 'Open a photo from your device',
  },
  tabs: { tools: 'Tools', adjust: 'Adjust', filters: 'Filters' },
  tools: {
    transform: 'Orientation',
    rotateLeft: 'Rotate left',
    rotateRight: 'Rotate right',
    flipH: 'Flip horizontally',
    flipV: 'Flip vertically',
    crop: 'Crop',
    resize: 'Resize',
    removeBg: 'Remove background',
    reset: 'Reset all edits',
  },
  crop: {
    hint: 'Drag the frame or its handles to choose the area to keep.',
    free: 'Free',
    apply: 'Apply crop',
    cancel: 'Cancel',
    ratio: 'Aspect ratio',
    size: (w, h) => `${w} × ${h} px`,
  },
  bg: {
    title: 'Background',
    tolerance: 'Tolerance',
    run: 'Remove background',
    running: 'Removing…',
    hint: 'Works best on plain, evenly lit backgrounds. If some background is left, raise the tolerance and run it again.',
  },
  adjust: {
    brightness: 'Brightness',
    contrast: 'Contrast',
    saturation: 'Saturation',
    hue: 'Hue',
    reset: 'Reset adjustments',
  },
  filters: {
    normal: 'Original',
    mono: 'Mono',
    sepia: 'Sepia',
    vintage: 'Vintage',
    cool: 'Cool',
    warm: 'Warm',
    vivid: 'Vivid',
    drama: 'Drama',
    fade: 'Fade',
    noir: 'Noir',
  },
  stage: {
    undo: 'Undo',
    redo: 'Redo',
    compare: 'Hold to compare',
    size: (w, h) => `${w} × ${h} px`,
    busy: 'Working…',
  },
  resize: {
    title: 'Resize image',
    description: 'Set the new size in pixels.',
    width: 'Width (px)',
    height: 'Height (px)',
    keep: 'Keep proportions',
    quick: 'Quick scale',
    limit: (mp, side) => `That size is too large. Keep it under ${mp} megapixels and ${side.toLocaleString('en-US')} px per side.`,
  },
  export: {
    title: 'Export image',
    description: 'Choose a format and save your photo.',
    format: 'Format',
    quality: 'Quality',
    filename: 'File name',
    size: 'Output size',
    download: 'Download',
    working: 'Preparing…',
    png: 'Lossless, keeps transparency',
    jpeg: 'Smaller files, no transparency',
    webp: 'Small files, keeps transparency',
  },
  toast: {
    loaded: 'Photo opened',
    notImage: 'That file is not an image. Choose a JPG, PNG, WebP or GIF.',
    loadFail: 'Could not open this image. The file may be damaged.',
    tooLarge: 'This image is too large to open safely. Use a file under 80 MB and about 190 megapixels.',
    downscaled: (w, h) => `Large photo scaled down to ${w} × ${h} px so editing stays smooth.`,
    cropped: (w, h) => `Cropped to ${w} × ${h} px`,
    resized: (w, h) => `Resized to ${w} × ${h} px`,
    bgDone: (p) => `Background removed (${p}% of the photo)`,
    bgNothing: 'No background found. Raise the tolerance or use a photo with a plainer background.',
    bgTooMuch: 'That removed almost everything. Lower the tolerance and try again.',
    bgFail: 'Could not remove the background. Try a different tolerance.',
    exported: (name) => `Saved ${name}`,
    exportFail: 'Could not export the image. Try another format or a smaller size.',
    formatUnsupported: 'Your browser cannot save this format. Choose PNG or JPEG.',
  },
  footer: {
    privacy: 'Your photos never leave your device.',
    source: 'Source code on GitHub',
    rights: 'All rights reserved.',
  },
  content: {
    featuresTitle: 'What you can do with PhotoWizard',
    features: [
      {
        icon: 'shield',
        title: 'Private by design',
        text: 'Photos are processed on your device with your browser. Nothing is uploaded, stored or tracked.',
      },
      {
        icon: 'crop',
        title: 'Crop, rotate and resize',
        text: 'Crop freely or to 1:1, 4:3, 3:2 and 16:9, turn the photo in 90° steps, flip it and set an exact pixel size.',
      },
      {
        icon: 'wand',
        title: 'Remove plain backgrounds',
        text: 'Make solid or studio-style backgrounds transparent, then save the result as PNG or WebP.',
      },
      {
        icon: 'sliders',
        title: 'Adjustments and filters',
        text: 'Tune brightness, contrast, saturation and hue, or pick one of nine ready-made looks with a live preview.',
      },
      {
        icon: 'undo',
        title: 'Undo and redo',
        text: 'Step back and forward through your edits with Ctrl+Z and Ctrl+Shift+Z, and hold a button to compare with the original.',
      },
      {
        icon: 'smartphone',
        title: 'Works on every screen',
        text: 'Touch-friendly controls for phones and tablets, light and dark themes, and keyboard shortcuts on desktop.',
      },
    ],
    stepsTitle: 'How it works',
    steps: [
      { title: 'Open a photo', text: 'Drop a file, paste an image or pick one from your device.' },
      { title: 'Edit it', text: 'Crop, rotate, resize, adjust colors, remove the background or try a filter.' },
      { title: 'Export', text: 'Save as PNG, JPEG or WebP. The file is created on your device.' },
    ],
    faqTitle: 'Questions and answers',
    faq: [
      {
        q: 'Is PhotoWizard free?',
        a: 'Yes. It is free, needs no account and adds no watermark to your photos.',
      },
      {
        q: 'Are my photos uploaded anywhere?',
        a: 'No. Every edit happens in your browser, so your files never leave your device. Close the tab and they are gone.',
      },
      {
        q: 'Which formats can I open and save?',
        a: 'You can open JPG, PNG, WebP, GIF and other formats your browser can display. You can save as PNG, JPEG or WebP.',
      },
      {
        q: 'How does background removal work?',
        a: 'PhotoWizard looks at the colors along the edges of the photo and removes the connected areas that match them. It is fast and private and works best on plain backgrounds. Busy scenes may need a dedicated AI tool.',
      },
      {
        q: 'Is there a size limit?',
        a: 'Photos above 16 megapixels are scaled down when you open them, so the editor stays responsive, especially on phones.',
      },
    ],
  },
};

const ru: Messages = {
  meta: {
    title: 'PhotoWizard: бесплатный приватный фоторедактор в браузере',
    description:
      'Обрезайте, поворачивайте, меняйте размер, удаляйте однотонный фон и добавляйте фильтры. PhotoWizard работает на вашем устройстве, ничего не загружается. Бесплатно, без регистрации.',
  },
  common: { close: 'Закрыть', cancel: 'Отмена', apply: 'Применить' },
  nav: {
    open: 'Открыть фото',
    export: 'Экспорт',
    language: 'Сменить язык',
    themeLight: 'Включить светлую тему',
    themeDark: 'Включить тёмную тему',
    themeSystem: 'Тема как в системе',
    skip: 'Перейти к содержимому',
    home: 'PhotoWizard, главная',
  },
  hero: {
    title: 'Редактируйте фото в браузере. Ничего не загружается на сервер.',
    subtitle:
      'Обрезка, поворот, изменение размера, удаление однотонного фона и фильтры. PhotoWizard работает целиком на вашем устройстве, поэтому снимки остаются приватными.',
    privacy: 'Бесплатно, без аккаунта и водяных знаков',
  },
  drop: {
    title: 'Перетащите фото сюда',
    hint: 'JPG, PNG, WebP или GIF. Изображение можно вставить через Ctrl+V.',
    choose: 'Выбрать фото',
    sample: 'Попробовать на примере',
    release: 'Отпустите, чтобы открыть фото',
    aria: 'Открыть фото с устройства',
  },
  tabs: { tools: 'Инструменты', adjust: 'Коррекция', filters: 'Фильтры' },
  tools: {
    transform: 'Ориентация',
    rotateLeft: 'Повернуть влево',
    rotateRight: 'Повернуть вправо',
    flipH: 'Отразить по горизонтали',
    flipV: 'Отразить по вертикали',
    crop: 'Обрезать',
    resize: 'Размер',
    removeBg: 'Удалить фон',
    reset: 'Сбросить все правки',
  },
  crop: {
    hint: 'Перетащите рамку или её углы, чтобы выбрать нужную область.',
    free: 'Свободно',
    apply: 'Применить обрезку',
    cancel: 'Отмена',
    ratio: 'Соотношение сторон',
    size: (w, h) => `${w} × ${h} px`,
  },
  bg: {
    title: 'Фон',
    tolerance: 'Допуск',
    run: 'Удалить фон',
    running: 'Удаляем…',
    hint: 'Лучше всего работает на однотонном и равномерно освещённом фоне. Если часть фона осталась, увеличьте допуск и запустите снова.',
  },
  adjust: {
    brightness: 'Яркость',
    contrast: 'Контраст',
    saturation: 'Насыщенность',
    hue: 'Оттенок',
    reset: 'Сбросить коррекцию',
  },
  filters: {
    normal: 'Оригинал',
    mono: 'Ч/Б',
    sepia: 'Сепия',
    vintage: 'Винтаж',
    cool: 'Холодный',
    warm: 'Тёплый',
    vivid: 'Яркий',
    drama: 'Драма',
    fade: 'Выцветший',
    noir: 'Нуар',
  },
  stage: {
    undo: 'Отменить',
    redo: 'Повторить',
    compare: 'Удерживайте для сравнения',
    size: (w, h) => `${w} × ${h} px`,
    busy: 'Обработка…',
  },
  resize: {
    title: 'Изменить размер',
    description: 'Задайте новый размер в пикселях.',
    width: 'Ширина (px)',
    height: 'Высота (px)',
    keep: 'Сохранять пропорции',
    quick: 'Быстрый масштаб',
    limit: (mp, side) => `Слишком большой размер. Не больше ${mp} мегапикселей и ${side.toLocaleString('ru-RU')} px по каждой стороне.`,
  },
  export: {
    title: 'Экспорт изображения',
    description: 'Выберите формат и сохраните фото.',
    format: 'Формат',
    quality: 'Качество',
    filename: 'Имя файла',
    size: 'Размер на выходе',
    download: 'Скачать',
    working: 'Подготовка…',
    png: 'Без потерь, с прозрачностью',
    jpeg: 'Меньше размер, без прозрачности',
    webp: 'Малый размер, с прозрачностью',
  },
  toast: {
    loaded: 'Фото открыто',
    notImage: 'Это не изображение. Выберите JPG, PNG, WebP или GIF.',
    loadFail: 'Не удалось открыть изображение. Возможно, файл повреждён.',
    tooLarge: 'Изображение слишком большое для безопасного открытия. Нужен файл до 80 МБ и около 190 мегапикселей.',
    downscaled: (w, h) => `Большое фото уменьшено до ${w} × ${h} px, чтобы редактор не тормозил.`,
    cropped: (w, h) => `Обрезано до ${w} × ${h} px`,
    resized: (w, h) => `Размер изменён: ${w} × ${h} px`,
    bgDone: (p) => `Фон удалён (${p}% изображения)`,
    bgNothing: 'Фон не найден. Увеличьте допуск или возьмите фото с более однотонным фоном.',
    bgTooMuch: 'Удалено почти всё. Уменьшите допуск и попробуйте снова.',
    bgFail: 'Не удалось удалить фон. Попробуйте другой допуск.',
    exported: (name) => `Сохранено: ${name}`,
    exportFail: 'Не удалось экспортировать изображение. Выберите другой формат или меньший размер.',
    formatUnsupported: 'Браузер не умеет сохранять в этом формате. Выберите PNG или JPEG.',
  },
  footer: {
    privacy: 'Ваши фото не покидают устройство.',
    source: 'Исходный код на GitHub',
    rights: 'Все права защищены.',
  },
  content: {
    featuresTitle: 'Что умеет PhotoWizard',
    features: [
      {
        icon: 'shield',
        title: 'Приватность по умолчанию',
        text: 'Фото обрабатываются на вашем устройстве средствами браузера. Ничего не загружается, не хранится и не отслеживается.',
      },
      {
        icon: 'crop',
        title: 'Обрезка, поворот и размер',
        text: 'Свободная обрезка или по пропорциям 1:1, 4:3, 3:2 и 16:9, поворот на 90°, отражение и точный размер в пикселях.',
      },
      {
        icon: 'wand',
        title: 'Удаление однотонного фона',
        text: 'Сделайте однотонный или студийный фон прозрачным и сохраните результат в PNG или WebP.',
      },
      {
        icon: 'sliders',
        title: 'Коррекция и фильтры',
        text: 'Настройте яркость, контраст, насыщенность и оттенок или выберите один из девяти готовых стилей с живым предпросмотром.',
      },
      {
        icon: 'undo',
        title: 'Отмена и повтор',
        text: 'Шагайте по правкам назад и вперёд через Ctrl+Z и Ctrl+Shift+Z, а кнопка сравнения покажет оригинал.',
      },
      {
        icon: 'smartphone',
        title: 'Работает на любом экране',
        text: 'Удобное управление касанием на телефонах и планшетах, светлая и тёмная темы, горячие клавиши на компьютере.',
      },
    ],
    stepsTitle: 'Как это работает',
    steps: [
      { title: 'Откройте фото', text: 'Перетащите файл, вставьте изображение или выберите его на устройстве.' },
      { title: 'Отредактируйте', text: 'Обрежьте, поверните, измените размер, поправьте цвета, удалите фон или примените фильтр.' },
      { title: 'Сохраните', text: 'Экспортируйте в PNG, JPEG или WebP. Файл создаётся на вашем устройстве.' },
    ],
    faqTitle: 'Вопросы и ответы',
    faq: [
      {
        q: 'PhotoWizard бесплатный?',
        a: 'Да. Он бесплатный, не требует аккаунта и не ставит водяные знаки на фото.',
      },
      {
        q: 'Мои фото куда-нибудь загружаются?',
        a: 'Нет. Все правки выполняются в браузере, поэтому файлы не покидают ваше устройство. Закроете вкладку, и они исчезнут.',
      },
      {
        q: 'Какие форматы можно открыть и сохранить?',
        a: 'Открывать можно JPG, PNG, WebP, GIF и другие форматы, которые показывает ваш браузер. Сохранять можно в PNG, JPEG или WebP.',
      },
      {
        q: 'Как работает удаление фона?',
        a: 'PhotoWizard определяет цвета по краям фото и убирает связанные с ними области того же цвета. Это быстро и приватно, лучше всего работает на однотонном фоне. Для сложных сцен лучше подойдёт специальный ИИ-инструмент.',
      },
      {
        q: 'Есть ли ограничение по размеру?',
        a: 'Фото больше 16 мегапикселей при открытии уменьшаются, чтобы редактор не тормозил, особенно на телефонах.',
      },
    ],
  },
};

export const messages: Record<Lang, Messages> = { en, ru };
export const LANGS: Lang[] = ['en', 'ru'];
