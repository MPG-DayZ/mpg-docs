---
aside: true
---

# MPG_Spawner_VPP

**MPG_Spawner_VPP** - админ-мод для VPPAdminTools, который добавляет в тулбар админ-панели кнопку "Спавнер": графический редактор конфигов MPG_Spawner. Точки, группы спавна, волны и общий конфиг мода правятся прямо из игры, без FTP и ручной возни с json. Мод работает с теми же файлами в `$profile:MPG_Spawner`, что и сам спавнер, и умеет применять изменения к живому серверу без рестарта.

Формат конфигов не меняется, так что можно совмещать: часть настроек руками в json, часть через редактор - спавнер разницы не увидит.

## Требования

- Установленные моды в load order (порядок важен): **VPPAdminTools** → **MPG_Spawner** → **MPG_Spawner_VPP**.
- Установка **на сервере и на клиенте админа**: интерфейс живёт на клиенте, чтение и запись конфигов - на сервере.
- Права VPPAdminTools (см. ниже).

## Права

Мод регистрирует в системе разрешений VPPAdminTools семь прав. Выдаются в VPPAdminTools → Permissions, у SuperAdmin'а доступны по умолчанию.

| Право | Что открывает |
|---|---|
| `MenuMPGSpawner` | Само меню (кнопка "Спавнер" в тулбаре админки) |
| `MenuMPGSpawner:EditPoint` | Создание, редактирование, дублирование и удаление точек |
| `MenuMPGSpawner:EditFiles` | Файловые операции: создать/переименовать/удалить конфиг-файлы |
| `MenuMPGSpawner:EditConfig` | Правка общего конфига мода ([modConfig](./mod-config.md)) |
| `MenuMPGSpawner:Reset` | Пересоздание триггера точки |
| `MenuMPGSpawner:Reload` | Полное перечитывание конфигов спавнера |
| `MenuMPGSpawner:Teleport` | Телепорт к точке |

::: warning Проверка прав - на сервере
Каждый запрос сервер проверяет по правам отправителя. Урезанные права просто прячут кнопки на клиенте, но и на сервере операция не пройдёт: "подкрутить" клиентом ничего не выйдет.
:::

## Что внутри

### Дерево конфигов и живой статус

Слева - все файлы точек из [pointsConfigs](./mod-config.md#pointsconfigs), внутри каждого - точки. По точке видно [pointId](./point-config.md#pointid), в каком файле она лежит, выключена ли в конфиге, создался ли её триггер на сервере и сколько живой живности и лута в нём прямо сейчас. Есть поиск по номеру и имени. Статус обновляется сам, поэтому удобно смотреть на работу триггеров вживую.

### Редактор точки

Открывается кликом по точке. Все параметры разбиты по вкладкам и повторяют разделы [конфига точки](./point-config.md):

- **Общее** - [pointId](./point-config.md#pointid), [isDisabled](./point-config.md#isdisabled), [isLogsEnabled](./point-config.md#islogsenabled), [showVisualisation](./point-config.md#showvisualisation), [showEntityLabels](./point-config.md#showentitylabels)
- **Триггер** - позиция, форма (сфера/цилиндр/куб) и размеры, [triggerDebugColor](./point-config.md#triggerdebugcolor), задержки ([triggerFirstDelay](./point-config.md#triggerfirstdelay), [triggerCooldown](./point-config.md#triggercooldown), [triggerEnterDelay](./point-config.md#triggerenterdelay)), [triggerSafeDistance](./point-config.md#triggersafedistance), расписание [triggerWorkingTime](./point-config.md#triggerworkingtime), [triggerDisabledChance](./point-config.md#triggerdisabledchance), очистка ([triggerCleanupOnLeave](./point-config.md#triggercleanuponleave), [triggerCleanupOnLunchTime](./point-config.md#triggercleanuponlunchtime), [triggerCleanupDelay](./point-config.md#triggercleanupdelay), [triggerInactiveResetDelay](./point-config.md#triggerinactiveresetdelay)), [triggerDisableOnWin](./point-config.md#triggerdisableonwin), [triggerDisableOnLeave](./point-config.md#triggerdisableonleave), [triggerRequireItem](./point-config.md#triggerrequireitem), [triggerGates](./point-config.md#triggergates)
- **Спавн** - [spawnList](./point-config.md#spawnlist) с шансом, здоровьем, количеством и лайфтаймом для каждой записи, [spawnMin](./point-config.md#spawnmin)/[spawnMax](./point-config.md#spawnmax)/[spawnCountLimit](./point-config.md#spawncountlimit), [spawnPositions](./point-config.md#spawnpositions), [spawnRadius](./point-config.md#spawnradius), [spawnLoopInside](./point-config.md#spawnloopinside), [spawnQueueDelay](./point-config.md#spawnqueuedelay), [clearDeathAnimals](./point-config.md#cleardeathanimals)/[clearDeathZombies](./point-config.md#cleardeathzombies), [enableEquipCE](./point-config.md#enableequipce)
- **Связи** - [triggerDependencies](./point-config.md#triggerdependencies) с [triggerDependenciesAnyOf](./point-config.md#triggerdependenciesanyof), [triggersToEnableOnEnter](./point-config.md#triggerstoenableonenter) и остальные triggersToEnable
- **Нотификации** - [notificationTitle](./point-config.md#notificationtitle), тексты входа/выхода/спавна/победы, [notificationTime](./point-config.md#notificationtime), [notificationIcon](./point-config.md#notificationicon)
- **Маппинг** - наборы [mappingData](./point-config.md#mappingdata): объекты с позицией, поворотом и масштабом, условия добавления и удаления
- **Волны** - [waveList](./waves.md#wavelist), [waveFirstDelay](./waves.md#wavefirstdelay), [waveDelayBetween](./waves.md#wavedelaybetween), [waveAfterAllWaves](./waves.md#waveafterallwaves), [waveContinueOnLeave](./waves.md#wavecontinueonleave), countdown-поля ([waveCountdownInterval](./waves.md#wavecountdowninterval), [waveCountdownFinalSeconds](./waves.md#wavecountdownfinalseconds))

Координаты руками вбивать не обязательно: кнопки "взять мою позицию" подставляют текущее место админа в [triggerPosition](./point-config.md#triggerposition) и в список позиций спавна. Настроил точку стоя на месте - сохранил.

Класснеймы в spawnList выбираются из каталога с поиском: зомби, животные, предметы (оружие и магазины в том числе) плюс ссылки `@группа` на [группы спавна](./groups.md). Каталог собирается из конфигов игры и модов на клиенте, так что контент сторонних модов там тоже есть. Для [triggerRequireItem](./point-config.md#triggerrequireitem) работает тот же каталог.

### Группы и волны

Записи [групп](./groups.md) и [волн](./waves.md) редактируются формой: условия ([spawnTime](./groups.md#spawntime), [chance](./groups.md#chance), [weather](./groups.md#weather)), [spawnList](./groups.md#spawnlist) с гридами, [triggerGates](./groups.md#triggergates), [spawnMin](./groups.md#spawnmin)/[spawnMax](./groups.md#spawnmax). У волн - условие завершения ([completion](./waves.md#completion): allDead/timer/remainingAlive), [delayAfter](./waves.md#delayafter), [cleanBefore](./waves.md#cleanbefore), [playerCountMultipliers](./waves.md#playercountmultipliers). Новые записи создаются из шаблона, существующие дублируются одной кнопкой.

Для тех, кто привык к сырому json, есть текстовый редактор: любой файл Points/Groups/Waves открывается целиком, правится как текст и сохраняется с проверкой синтаксиса.

### Аудит конфигов

Вкладка "Ошибки" прогоняет все конфиги (точки, группы, волны) через проверки и показывает сводку с разбивкой на ошибки/предупреждения/инфо: битые ссылки `@групп` и волн, ссылки на несуществующие точки (зависимости, triggersToEnable), кривые позиции и тайм-рейнджи, циклы во вложенных группах, занятые имена, незнакомая погода. Клик по проблеме открывает редактор точки, к которой она относится.

### Массовые правки

Выбрал файл - выставил общее поле сразу всем точкам в нём: например, включить [isLogsEnabled](./point-config.md#islogsenabled) везде или погасить [showVisualisation](./point-config.md#showvisualisation) перед релизом. Поддерживаются все булевы параметры точки плюс флаги маппинга (addOnEnter, removeOnWin и остальные).

### Конфиг мода и файловые операции

Вкладка "Конфиг" правит [modConfig](./mod-config.md): список файлов [pointsConfigs](./mod-config.md#pointsconfigs), [admins](./mod-config.md#admins), [logLevel](./mod-config.md#loglevel), [isModDisabled](./mod-config.md#ismoddisabled). Файлы конфигов создаются, переименовываются и удаляются прямо из дерева.

## Как применяются изменения

- **Точка**: сохранение сразу пишет json, а при включённом "применить сразу" пересоздаёт триггер этой конкретной точки. Остальные триггеры не трогаются.
- **Группы, волны и текстовый редактор**: файл сохраняется, и спавнер перечитывает конфиги целиком - если у админа есть право `:Reload`. Без права файл просто ляжет на диск до следующего reload.
- **Reset точки** пересоздаёт её триггер с текущими настройками - по сути перезапуск одной точки.
- **Reload** делает то же, что рестарт сервера делает с конфигами спавнера, только без рестарта.

Перед каждой записью предыдущая версия файла уезжает в бэкап: `$profile:MPG_Spawner/AdminBackups/`. Испортили - откатились.

## Нюансы

::: tip Несохранённые правки
При переключении редактора или файла мод спросит, что делать с несохранёнными изменениями. Деструктивные операции (удаление точки, файла, группы, волны) идут с подтверждением.
:::

- Интерфейс локализован (русский и английский): каждый клиент видит меню на своём языке.
- Действия админов пишутся в лог MPG_ModsLogger с префиксом `[MPG_Spawner_VPP]`: кто, что и когда сохранил, удалил, куда телепортировался.
- Редактор - это оболочка над конфигами, а не второй спавнер: все проверки валидности (см. [Валидация и логи](./waves.md#валидация-и-логи)) делает сам MPG_Spawner.

## Логи

Все действия админов идут через логгер MPG с префиксом `[MPG_Spawner_VPP]` и содержат имя, steamid и описание операции:

- `saved point #136 in TestPoints.json; ...` - точка сохранена, дальше статус применения.
- `created group nightBandits in Groups/AIBandits.json; ...` - создана группа.
- `reloaded all MPG_Spawner configs; ...` - перечитывание конфигов.
- `teleported to point #128` - телепорт админа к точке.
- Статус применения (`recreated trigger`, `reloaded`, `unchanged`) дописывается в конец каждой операции.
