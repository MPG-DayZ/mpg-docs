---
editLink: true
---

# Получение данных

## Хук `data()`

Простой и понятный способ получить исходные данные страницы - использовать хук [`data()`](https://vike.dev/data) вместе
с компонентным хуком [`useData()`](https://vike.dev/useData).

С полной документацией по [data fetching](https://vike.dev/data-fetching) можно ознакомиться на
официальном [сайте](https://vike.dev/)

## Хук `useData()`

Хук компонента `useData()` позволяет нам получить доступ к значению, возвращаемому хуком `data()`.

Вы также можете получить доступ к данным через pageContext.data. Фактически ` const { data } = usePageContext()`
возвращает то же значение, что и useData().

Использование pageContext.data вместо useData() имеет смысл, если вы хотите получить доступ к данным в хуках Vike,
поскольку useData() работает только внутри компонентов пользовательского интерфейса (а не внутри хуков Vike).

## Гайд по использованию, на примере получения данных для footer и header из cms

Хук `data()` рекомендуется использовать только для получения исходных данных страницы.

Так как `+data.ts` находится в корневой папке с роутами, соответственно в нем должно осуществляться получение всех
инициализационных данных приложения.

Для конкретных страниц, например `home`, получение инициализационных данных осуществляется
в `src/routes/home/pages/index/+data.ts`

```ts
// src/routes/+data.ts - root directory
// Environment: server

export { data };
export type Data = Awaited<ReturnType<typeof data>>;

import { ofetch } from 'ofetch';

async function data(pageContext: PageContextServer) {
  const headerData = await ofetch(`/cms-content/api/header`);
  const footerData = await ofetch(`/cms-content/api/footer`);

  // `headerData and footerData` are can serialized and passed to the client. Therefore, we pick only the
  // data the client needs in order to minimize what is sent over the network.

  return {
    headerData,
    footerData,
  };
}
```

Далее нужно получить доступ к этим данным из компонента с помощью хука `useData()`

Для этого используем имплементацию `useData()` из [vike-vue](https://vike.dev/vike-vue)

```ts
// src/routes/+Layout.vue
// Environment: server, client

import { useData } from 'vike-vue/useData';
import type { Data } from './+data';

const { headerData, footerData } = useData<Data>();

`<template>
  <LayoutDefault :headerData :footerData />
</template>
`;
```
