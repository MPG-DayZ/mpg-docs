---
editLink: true
aside: false
---

# Хорошие практики по Tailwind на проекте

### Старайтесь использовать стандартные стили для отступов

Дефолтный конфиг tailwind сделан максимально близко с дизайн-киту, поэтому отступы по сути стандартизированы

```diff
- <div class="mt-[61px]"></div>
+ <div class="mt-16"></div>
```

### Используйте горизонтальные отступы с учётом RTL

Сайт рано или поздно, будет иметь RTL версию, использование правильных отступов сократит затраты на проверку и исправление сайта под RTL.

```diff
- <div class="pl-4 pr-5 mr-6 ml-8"></div>
+ <div class="ps-4 pe-5 ms-6 me-8"></div>
```

### Не изобретайте велосипеды, там, где это не нужно

Дизайн рисуется по сетке, поэтому и вёрстку так или иначе можно подогнать под неё (сетку можно включить в фигме).

Достаточно грубый, но наглядный пример, как можно реализовать одинаковое отображение с использованием большого количества произвольных значений и с использованием стандартных классов TW

```diff
-<div class="container grid w-full grid-cols-1 justify-between gap-11 py-11 sm:grid-cols-[231px_649px] sm:gap-7 sm:py-[60px] md:grid-cols-[369px_379px_409px] lg:grid-cols-[385px_500px_409px]">
+<div class="container grid pt-14 sm:grid-cols-12">
-  <div class="sm:mb-8 md:pe-[60px] lg:pe-0">
+  <div class="mt-1 sm:col-span-3">
-  <UiButton class="!mb-11 w-full sm:!mb-[60px] sm:w-auto">
+  <UiButton class="flex- w-full sm:w-auto">
      {{ buttonSupport.text }}
    </UiButton>
  </div>
-  <div class="flex flex-col gap-2 text-sm sm:mb-8 sm:flex-row sm:justify-between sm:gap-0 md:col-span-2 md:gap-[34px] md:justify-self-start lg:gap-[99px]">
+  <div class="grid grid-cols-3 gap-10 ps-1.5 sm:col-span-10 sm:col-start-5">
-    <div v-for="..." class="flex flex-col items-start gap-6 max-sm:hidden sm:w-[194px] md:w-[247px]" :key="...">
       <a v-for="..." :href="link.href" :key="...">{{ link.text }}</a>
-    </div>
+    <ul v-for="..." class="col-auto" :key="...">
+      <li v-for="..." class="mb-6 mt-1" :key="...">
         <a class="hover:underline" :href="link.href">{{ link.text }}</a>
+      </li>
+    </ul>
  </div>
```

### Старайтесь избегать старых цветов

Цвета, имеющие в названиии `-old` являются устаревшими и должны быть максимально ограницены в использовании.

### Как понять стоит ли использовать @apply

На странице с документацией по TW есть секция про [@apply - зло](rules.md#apply-%D0%B7%D0%BB%D0%BE).

Как выяснилось, требуется разъяснения о том, что значит фраза:

> Когда технически выгоднее написать @apply вместо классов в html коде.

Применительно к использованию `@apply` техническая выгода наступает в момент, когда плюсы от использования `@apply` перевешивают его же минусы.

В документации по tailwind описаны [примеры использования @apply](https://tailwindcss.com/docs/reusing-styles#extracting-classes-with-apply), а так же отдельно указаны причины, по которым необходимо [избегать использование @apply](https://tailwindcss.com/docs/reusing-styles#avoiding-premature-abstraction)

Хорошим примером технической выгоды от использования `@apply` может быть часто используемый и при этом достаточно большой набор классов. Выгода очевидна, когда количество CSS кода будет гораздо меньше, чем количество текста в классе элемента.

Детальный ответ на вопрос может дать себе только разработчик при непосредственном выполнении задачи т.к. каждый конкртеный случай требует внимания т.к. бездумно писать код на tailwind - плохая практика.
