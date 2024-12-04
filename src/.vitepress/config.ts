import { transformerTwoslash } from '@shikijs/vitepress-twoslash';
import { defineConfig } from 'vitepress';

import { nav } from './nav';
import { sidebar } from './sidebar';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Dev Docs',
  description: 'Документация для разработчиков',
  lang: 'ru',

  outDir: '../build',
  // Отключено, потому что в пайплайне нет гита, который используется для получения даты изменения страницы
  lastUpdated: false,
  cleanUrls: false,
  ignoreDeadLinks: [/:\/\/localhost/],

  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    codeTransformers: [transformerTwoslash()],
  },
  head: [
    ['link', { rel: 'apple-touch-icon', size: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'icon', type: 'image/png', size: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', size: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['link', { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#000000' }],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }],
    ['meta', { name: 'theme-color', content: '#000000' }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav,
    sidebar,
    logo: '/logo.png',
    // Не отключать т.к. сверху (сбоку на больших экранах) отображается содержимое страницы
    // aside: false,
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Поиск',
          },
          modal: {
            resetButtonTitle: 'Отмена',
            backButtonTitle: 'Назад',
            noResultsText: 'Ничего не найдено по',
            footer: {
              selectText: 'Выбрать',
              navigateText: 'Навигация',
              closeText: 'Закрыть',
            },
          },
        },
      },
    },
    notFound: {
      title: 'Страница не найдена',
      quote: 'Но если вы не меняли текущую директиву и продолжаете смотреть, вы можете оказаться там куда направлялись',
      linkText: 'Домой',
    },
    sidebarMenuLabel: 'Меню',
    darkModeSwitchLabel: 'Цветовая схема',
    lightModeSwitchTitle: 'Светлая тема',
    darkModeSwitchTitle: 'Темная тема',
    docFooter: {
      prev: 'Предыдущая',
      next: 'Следующая',
    },
    returnToTopLabel: 'Скролл вверх',
    outline: {
      label: 'Содержание:',
    },
    editLink: {
      pattern: 'https://gitlab.letoile.tech/webui/web/dev-docs/-/tree/master/src/:path',
      text: 'Редактировать страницу',
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ['vitepress'],
    },
    server: {
      hmr: {
        overlay: false,
      },
    },
  },
});
