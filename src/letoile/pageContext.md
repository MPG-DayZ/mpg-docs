---
editLink: true
---

# Работа с pageContext

`// Environment: server, client.`

Объект `pageContext` предоставляет контекстную информацию о текущей странице.

```ts
// /pages/product/@id/+data.ts

export async function data(pageContext) {
  // Common built-in properties
  pageContext.urlParsed.pathname; // /product/42
  pageContext.routeParams.id; // 42
  pageContext.headers; // { cookie: 'user-id=1337', ... }
  // Common custom properties
  pageContext.user; // { name: 'John', id: 1337 }
  pageContext.initialStoreState; // { time: 1718872184291 }
}
```

Он включает:

- Встроенные свойства, такие как `pageContext.urlParsed` и `pageContext.routeParams`.
- Пользовательские свойства, которые вы можете добавить, например `pageContext.user`.

Он доступен для всех:

- Хуков Vike, таких, как `data()`.
- Компоненты пользовательского интерфейса, [см. `usePageContext()`](#хук-usepagecontext).
- Вы также можете получить доступ к pageContext со стороны клиента, используя `passToClient`.

Более детальная информация об объекте содержится в [документации](https://vike.dev/pageContext)
и [хук](https://vike.dev/usePageContext) по работе с ним

## Резюме

Основная цель объекта `pageContext` — хранить информацию, необходимую для рендеринга страницы.

На стороне сервера при новом входящем HTTP-запросе создается новый объект pageContext, который используется для
рендеринга HTML, включенного в HTTP-ответ. Объект `pageContext` очищается после отправки HTML-ответа.

На стороне клиента при навигации по странице на стороне клиента объект `pageContext` предыдущей страницы очищается и
создается новый объект pageContext.

Во время сборки при предварительном рендеринге для каждого URL-адреса создается объект `pageContext`, который
сохраняется в `dist/client/${url}/index.pageContext.json`.

Vike добавляет информацию в `pageContext` только во время рендеринга страницы, поэтому после завершения рендеринга
страницы запрещается мутировать `pageContext`. Следовательно: использовать `pageContext` для хранения состояния
пользовательского интерфейса.
Если вы используете предварительную визуализацию, то объект `pageContext` каждого URL-адреса фиксируется уже во время
сборки.

Объект `pageContext` доступен из любого хука Vike и любого компонента пользовательского интерфейса, но не стоит забывать
о различии types на клиенте и сервере (`PageContext/PageContextServer/PageContextClient`)

## Хук `usePageContext()`

`// Environment: server, client.`

Хук `usePageContext()` позволяет любому компоненту пользовательского интерфейса получать доступ к объекту `pageContext`.

Для vue реализована имплементация в расширении [vike-vue](https://vike.dev/vike-vue)

## pageContext.json

При навигации по страницам Vike делает HTTP-запрос `pageContext.json` на наш express сервер, чтобы передать данные,
полученные на стороне сервера (например, с помощью `data()`), на сторону клиента.
`HTTP GET /search/index.pageContext.json`

Запрос `/search/index.pageContext.json` возвращает данные, извлеченные хуком `data()`.

> Запрос в `pageContext.json` выполняется если удовлетворенно одно из двух следующих условий: Страница имеет серверный
> хук `data()` или `onBeforeRender()`.
