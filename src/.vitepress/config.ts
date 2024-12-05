import {transformerTwoslash} from '@shikijs/vitepress-twoslash';
import {defineConfig} from 'vitepress';

import {nav} from './nav';
import {sidebar} from './sidebar';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'MPG Mods',
  description: 'Документация по модам',
  lang: 'ru',

  outDir: '../build',
  // Отключено, потому что в пайплайне нет гита, который используется для получения даты изменения страницы
  lastUpdated: true,
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
    ['link', {rel: 'icon', type: 'image/png', size: '96x96', href: '/favicon-96x96.png'}],
    ['link', {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=1'}],
    ['link', {rel: 'shortcut icon', href: '/favicon.ico'}],
    ['link', {rel: 'apple-touch-icon', size: '180x180', href: '/apple-touch-icon.png'}],
    ['link', {rel: 'apple-mobile-web-app-title', content: 'MPG Mods'}],
    ['link', {rel: 'manifest', href: '/site.webmanifest'}],
    ['meta', {name: 'theme-color', content: '#00a3bb'}],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav,
    sidebar,
    logo: '/logo-small.png',
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
    lastUpdated: {
      text: 'Обновлено',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },
    socialLinks: [
      // https://simpleicons.org/
      { icon: 'discord', link: 'https://discord.gg/zgNRg5n5UG'},
      { icon: 'steam', link: 'https://steamcommunity.com/id/pafnuty10' },
    ]
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
