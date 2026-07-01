---
aside: true
---

# Конфиг мода

Конфиг мода находится в файле `MPG_BossHorde/Config.json` внутри папки с профилем сервера.

## configVersion

`configVersion` - Версия конфига, служебное поле, не нужно его менять. Оно обновляется само при обновлении мода, если в
этом есть необходимость.

## documentation

`documentation` - Cлужебное поле, содержит ссылку на документацию по моду для вашего удобства.

## isModDisabled

`isModDisabled` - Включение или отключение мода целиком.

## logLevel

`logLevel` - Уровень логирования мода. Определяет, какие сообщения будут записываться в лог-файл.

::: danger Внимание!

### Для корректной работы логирования нужен дополнительный серверный мод [MPG_ModsLogger](https://steamcommunity.com/sharedfiles/filedetails/?id=3755713051)

Без этого мода логи будут писаться просто в сриптлоги сервера, а не в отдельный файл.
:::

Доступные значения:

- `1` - **TRACE**: максимальная детализация (позиции спавна, итерации циклов, каждый add/remove подопечных).
- `2` - **DEBUG**: детальная отладка (счётчики спавна, коэффициенты, решения о спавне, состояния агрессии).
- `3` - **INFO** (по умолчанию): минимально необходимые данные (старт/остановка босса, ошибки, смерти, cleanup).
- `4` - **WARN**: только предупреждения и ошибки (невалидный конфиг, loopLimit).
- `5` - **ERROR**: только ошибки (не удалось создать объект).
- `6` - **FATAL**: только критические ошибки.

Пример: `"logLevel": 3,`

## masters

`masters` - Список боссов и настройка каждого босса.

---

::: tip
Ниже описаны параметры конфигурации одного босса.

Боссов может быть столько, сколько вам необходимо, каждый босс - это один элемент списка [masters](#masters)
:::

---

## Быстрый старт

Если вы настраиваете мод впервые - начните с простого. Ниже минимально достаточные примеры,
которые можно скопировать в `Config.json` целиком. Все неуказанные параметры получат значения по умолчанию.

::: tip Про значения «да/нет»
В параметрах-флажках (включить/выключить) можно писать и `1`/`0`, и `true`/`false` - мод понимает оба варианта.
В файле, который мод создаёт сам, такие поля сохраняются как `1`/`0`.
:::

## Самый простой босс

Медведь, вокруг которого появляются волки, когда он замечает игрока. Больше ничего не настраиваем -
остальное мод берёт на себя.

```json
{
  "configVersion": 9,
  "documentation": "https://docs.mpg-dayz.ru/boss-horde/",
  "isModDisabled": 0,
  "logLevel": 3,
  "masters": [
    {
      "master": "Animal_UrsusArctos",
      "slaves": [
        "Animal_CanisLupus_Grey",
        "Animal_CanisLupus_White"
      ]
    }
  ]
}
```

Здесь обязательны только два поля у босса:

- [master](#master) - кто будет боссом (класснейм животного или зомби).
- [slaves](#slaves) - кто будет подопечными (список класснеймов).

## Простой босс с базовыми настройками

Тот же медведь, но с управлением количеством подопечных, радиусом и задержками. Это типовая отправная точка,
которую дальше можно усложнять.

```json
{
  "configVersion": 9,
  "documentation": "https://docs.mpg-dayz.ru/boss-horde/",
  "isModDisabled": 0,
  "logLevel": 3,
  "masters": [
    {
      "master": "Animal_UrsusArctos",
      "masterAggressiveLevel": 3,
      "spawnRadius": "10-20",
      "spawnFirstDelay": "5-10",
      "spawnCount": "1-2",
      "spawnCountFirstTime": "3-5",
      "spawnCoolDown": "10-15",
      "cleanDeadSlaves": 2,
      "cleanSlavesOnWin": 3,
      "slaves": [
        "Animal_CanisLupus_Grey",
        "Animal_CanisLupus_White"
      ]
    }
  ]
}
```

Когда этот вариант станет понятен - переходите к более сложным механикам: [системе волн](#wavesystem),
[спавну за спиной игрока](#behindspawn), [порционному спавну](#spawnbatch) и
[масштабированию по числу игроков](#playercountmultipliers).

---

## Настройка босса

## master

`master` - Класснейм босса. Можно использовать базовый класс.

Пример: `"master": "Animal_UrsusArctos",`

## masterAggressiveLevel

`masterAggressiveLevel` - Уровень аггрессии, при котором будет происходить спавн.

У животных уровень от 0 до 3, у зомби от 0 до 1.

Пример: `"masterAggressiveLevel": 3,`

## masterNoDamageIfSlavesAlive <Badge type="warning" text="1.3" title="Добавлено в версии 1.3" />

`masterNoDamageIfSlavesAlive` - Получение урона только тогда, когда у босса нет подопечных, например убиты или ещё не
появились.

- `0` - урон будет проходить.
- `1` - Урон не будет проходить, пока у босса есть хотя бы один подопечный.

Пример: `"masterNoDamageIfSlavesAlive": 1,`

## masterDamageCoef <Badge type="warning" text="2.0" title="Добавлено в версии 2.0" />

`masterDamageCoef` - Множитель урона боссу. Позволяет гибко настраивать получаемый боссом урон вместо булева
параметра [masterNoDamageIfSlavesAlive](#masternodamageifslavesalive).

- `-1` - не задан, используется параметр [masterNoDamageIfSlavesAlive](#masternodamageifslavesalive).
- `0.0` - урон полностью блокируется (аналог `masterNoDamageIfSlavesAlive = 1`).
- `1.0` - урон проходит полностью (аналог `masterNoDamageIfSlavesAlive = 0`).
- `0.0`–`1.0` - урон умножается на указанный коэффициент.

::: warning Не больше 1.0
Значения больше `1.0` не поддерживаются - мод предупредит в логе. Для усиления урона боссу
используйте значения в диапазоне от `0.0` до `1.0`.
:::

Если указан - параметр [masterNoDamageIfSlavesAlive](#masternodamageifslavesalive) игнорируется.

Примеры:

```
"masterDamageCoef": -1,   - не задан, используется masterNoDamageIfSlavesAlive
"masterDamageCoef": 0.5,  - босс получает 50% урона
"masterDamageCoef": 0,    - урон полностью блокируется
```

## spawnIfMasterSilent

`spawnIfMasterSilent` - Спавнить ли подопечных, если босс находится в спокойном состоянии (не агрится на игрока).

1 - да, 0 - нет.

Пример: `"spawnIfMasterSilent": 0,`

## spawnRadius

`spawnRadius` - Радиус спавна подопечных вокруг босса в метрах.

Можно задать диапазон значений через чёрточку, тогда будет взято случайное число между указанными.

Примеры:

```
"spawnRadius": "5.5-20.0", - радиус спавна будет от 5.5 до 20 метров
"spawnRadius": "3", - радиус спавна будет 3 метра
"spawnRadius": "10-20", - радиус спавна будет от 10 до 20 метров
```

## spawnFirstDelay

`spawnFirstDelay` - Задержка первого спавна в секундах. Указываем через чёрточку, тогда будет случайное число.

Примеры:

```
"spawnFirstDelay": "3", - будет 3 секунды
"spawnFirstDelay": "3-30", - будет от 3х до 30ти секунд
"spawnFirstDelay": "5-10",  - будет от 5ти до 10ти секунд
```

## spawnCountLimit

`spawnCountLimit` - Максимальное число подопечных, которые будут одновременно находиться на карте.

Если значение параметр больше нуля, то при достижении указанного количества подопечные больше не будут спавниться до
тех пор, пока не будут убиты.

Например, при лимите 5 и указанном параметре [spawnCount](#spawncount) `15` не будет появляться больше,
чем 5 подопечных, когда будет убит один подопечный, появится только один.

Пример: `"spawnCountLimit": 0,`

## spawnCount

`spawnCount` - Количество подопечных, которые будут появляться за один раз.

Указываем через чёрточку, тогда будет
случайное число каждый раз.

Пример: `"spawnCount": "1-2",`

## spawnCountFirstTime

`spawnCountFirstTime` - Количество подопечных, которые будут появляться первый раз.

Указываем через чёрточку, тогда будет случайное число.

Пример: `"spawnCountFirstTime": "3-5",`

## spawnCoolDown

`spawnCoolDown` - Задержка перед следующей попыткой спавна подопечных (перезарядка босса) в секундах.

Указываем через чёрточку, тогда будет случайное число каждый раз.

Пример: `"spawnCoolDown": "10-15",`

## cleanDeadSlaves

`cleanDeadSlaves` - Время в секундах, через которое будет удалён убитый подопечный.

Если указать ноль - убитые подопечные не будут удаляться модом и пропадут в соответсвии с параметрами экономики.

Пример: `"cleanDeadSlaves": 2,`

## cleanSlavesOnWin

`cleanSlavesOnWin` - Время в секундах, через которое будут удалены все живые подопечные, если босс будет убит.

Если указать ноль - подопечные не пропадут со смертью босса.

Пример: `"cleanSlavesOnWin": 3,`

## cleanSlavesOnFocusLoss

`cleanSlavesOnFocusLoss` - Включение удаления подопечных, если босс потерял интерес к игроку.

1 - удалять, 0 - не удалять.

Удаление происходит без задержки.

Пример: `"cleanSlavesOnFocusLoss": 0,`

## killSlavesBeforeClean <Badge type="warning" text="1.1" title="Добавлено в версии 1.1" />

`killSlavesBeforeClean` - При включении этого параметра и работающем
параметре [cleanSlavesOnFocusLoss](#cleanslavesonfocusloss) и/или [cleanSlavesOnWin](#cleanslavesonwin) животные и зомби
будут умирать и только потом удаляться.

Задержка перед удалением будет увеличена на 2 секунды, что бы корректно
отрабатывала анимация смерти.

1 - включено, 0 - выключено.

Пример: `"killSlavesBeforeClean": 1,`

## playerCountRadius <Badge type="warning" text="2.0" title="Добавлено в версии 2.0" />

`playerCountRadius` - Радиус в метрах вокруг босса, в котором подсчитываются игроки для расчёта множителя
количества подопечных.

Если указать `0` - множитель от количества игроков не используется.

Работает вместе с параметром [playerCountMultipliers](#playercountmultipliers).

Пример: `"playerCountRadius": 100.0,`

## playerCountMultipliers <Badge type="warning" text="2.0" title="Добавлено в версии 2.0" />

`playerCountMultipliers` - Таблица порогов множителя подопечных в зависимости от количества игроков
в радиусе [playerCountRadius](#playercountradius).

Каждый элемент - объект с полями:

- `players` - минимальное количество игроков для срабатывания порога.
- `coef` - коэффициент умножения [spawnCount](#spawncount) (или `spawnCount` волны при включённой системе волн).

Мод выбирает коэффициент по наибольшему подходящему порогу. Если ни один порог не подошёл - используется `1.0`.

Пример:

```json
"playerCountMultipliers": [
{"players": 1, "coef": 1.0},
{"players": 3, "coef": 1.5},
{"players": 5, "coef": 2.0},
{"players": 8, "coef": 3.0}
]
```

В данном примере: 1 игрок - 1x подопечных, 3 игрока - 1.5x, 5 игроков - 2x, 8 и более - 3x.

## spawnBatch <Badge type="warning" text="2.0" title="Добавлено в версии 2.0" />

`spawnBatch` - Настройка порционного спавна подопечных. Вместо единовременного появления всех подопечных
они спавнятся порциями с задержкой между ними.

Содержит два поля:

- `size` - количество подопечных в одной порции. Должно быть меньше [spawnCount](#spawncount).
- `delay` - задержка между порциями в секундах. Можно указать диапазон через чёрточку.

Если `spawnBatch` не указан или `size` равен `0` - спавн происходит единовременно.

При включённой системе волн можно задать `spawnBatch` как на уровне босса (применяется ко всем волнам),
так и на уровне отдельной волны (переопределяет настройку босса).

Примеры:

```json
"spawnBatch": {
"size": 3,
"delay": "2-4"
}
```

```
При spawnCount: "10" и spawnBatch.size: 3, spawnBatch.delay: "2-4":
- Спавнится 3 подопечных
- Через 2-4 секунды ещё 3
- Через 2-4 секунды ещё 3
- Через 2-4 секунды последний 1
```

## behindSpawn <Badge type="warning" text="2.0" title="Добавлено в версии 2.0" />

`behindSpawn` - Механика спавна подопечных за спиной игрока при дальних атаках по боссу.
Когда игрок наносит урон боссу с расстояния больше `minTriggerDistance`, подопечные спавнятся
за спиной этого игрока вместо стандартного спавна вокруг босса.

Механика работает **независимо** от стандартного спавна и системы волн - она активируется
при каждом попадании по боссу с проверкой cooldown.

Пример структуры:

```json
"behindSpawn": {
"enabled": true,
"minTriggerDistance": 50.0,
"spawnDistance": "10-15",
"spawnSpread": "3-5",
"spawnCount": "1-2",
"chance": 1.0,
"cooldown": "15-30",
"maxActivations": 0,
"addToSlavesMap": true,
"slaves": null
}
```

### enabled

`enabled` - Включение или отключение механики.

Пример: `"enabled": true,`

### minTriggerDistance <Badge type="warning" text="2.0" />

`minTriggerDistance` - Минимальное расстояние (в метрах) между игроком и боссом, при котором механика активируется. Если
игрок ближе - спавн за спиной не сработет.

Пример: `"minTriggerDistance": 50.0,`

### spawnDistance

`spawnDistance` - Расстояние за спиной игрока, на котором появятся подопечные (в метрах).

Можно задать диапазон через чёрточку.

Примеры:

```
"spawnDistance": "10-15", - от 10 до 15 метров за спиной
"spawnDistance": "8",     - ровно 8 метров
```

### spawnSpread

`spawnSpread` - Боковой разброс спавна вокруг точки за спиной игрока (в метрах).
Разброс симметричный - подопечные могут появиться как слева, так и справа.

Можно задать диапазон через чёрточку.

Примеры:

```
"spawnSpread": "3-5", - разброс от 3 до 5 метров в каждую сторону
"spawnSpread": "2",   - разброс 2 метра
```

### spawnCount

`spawnCount` - Количество подопечных, появляющихся за одну активацию.

Можно задать диапазон через чёрточку.

Пример: `"spawnCount": "1-2",`

### chance

`chance` - Шанс срабатывания механики при каждом попадании по боссу.

- `1.0` - срабатывает всегда при выполнении условий.
- `0.5` - срабатывает в 50% случаев.

Пример: `"chance": 0.7,`

### cooldown

`cooldown` - Перезарядка между активациями механики в секундах.

Можно задать диапазон через чёрточку.

Примеры:

```
"cooldown": "15-30", - от 15 до 30 секунд
"cooldown": "20",    - ровно 20 секунд
```

### maxActivations

`maxActivations` - Максимальное количество активаций за жизнь босса.

- `0` - без ограничений.
- `3` - механика сработает не более 3 раз.

Пример: `"maxActivations": 0,`

### addToSlavesMap

`addToSlavesMap` - Управляет привязкой заспавненных подопечных к боссу.

- `true` - подопечные добавляются в общий список босса, влияют на:
    - [completionCondition](#completioncondition) (учитываются при подсчёте живых)
    - [masterDamageCoef](#masterdamagecoef) / [masterNoDamageIfSlavesAlive](#masternodamageifslavesalive)
    - [cleanSlavesOnWin](#cleanslavesonwin) (удаляются при смерти босса)
    - [spawnCountLimit](#spawncountlimit) (увеличивают счётчик)
- `false` - подопечные спавнятся как независимые существа:
    - Не влияют на логику босса
    - Не получают таймер очистки ([cleanDeadSlaves](#cleandeadslaves))
    - Не удаляются при смерти босса
    - Не учитываются в [spawnCountLimit](#spawncountlimit)

Пример: `"addToSlavesMap": true,`

### slaves (behindSpawn)

`slaves` - Отдельный список класснеймов подопечных для behind-spawn.
Формат аналогичен основному полю [slaves](#slaves).

Если не указан (`null`) - используется основной список подопечных босса.

Пример:

```json
"slaves": [
"ZmbM_CitizenASkinny_Blue|0.5",
"Animal_CanisLupus_Grey|0.3"
]
```

---

## slaves

`slaves` - Класснеймы подопечных.

Через разделитель `|` можно дополнительно настроить шанс спавна, лайвтайм и здоровье:

```
"Класснейм|шанс|лайвтайм|здоровье"
```

Всего **4 поля** через `|`. Любое поле можно пропустить - тогда будет применено значение по умолчанию.

::: tip Пробелы не обязательны
Пробелы перед и после `|` ставить не обязательно - они нужны только для наглядности.
Мод сам удаляет пробелы при чтении.
:::

### Сводная таблица полей

| Поле          | Что задаёт             | Формат                                     | Значение по умолчанию   |
|---------------|------------------------|--------------------------------------------|-------------------------|
| **класснейм** | кто появится           | класснейм животного/зомби/предмета         | обязательно             |
| **шанс**      | вероятность появления  | число от `0` до `1` (например `0.7` = 70%) | `1` (появляется всегда) |
| **лайвтайм**  | время жизни в секундах | целое число больше `0`                     | из настроек экономики   |
| **здоровье**  | количество здоровья    | см. коды ниже                              | дефолтное здоровье      |

::: warning Шанс - это просто число
Поле «шанс» принимает только число от `0` до `1` (например `0.5`). Специальные коды `-3`/`-2`/`-1`
для шанса **не работают** - они применяются только к здоровью.
:::

### Коды для здоровья

| Код   | Что значит                                            |
|-------|-------------------------------------------------------|
| `-3`  | дефолтное здоровье из настроек экономики              |
| `-2`  | полностью случайное (от 0 до максимума)               |
| `-1`  | максимальное здоровье                                 |
| `N`   | `N` процентов от максимума (например `50` = половина) |
| `N-M` | случайное значение от `N`% до `M`% (например `10-50`) |

Примеры:

```
  "slaves": [
  "ZmbF_MechanicNormal_Beige|0.7",                - шанс спавна 70%, здоровье по умолчанию
  "Animal_CanisLupus_Grey|0.3",                   - шанс спавна 30%, здоровье по умолчанию
  "Animal_CanisLupus_White|1|-3|0.1-10"           - шанс 100%, лайвтайм по умолчанию, здоровье 0.1-10%
  "ZmbM_usSoldier_Heavy_Woodland|0.5|-3|50-80"    - шанс 50%, лайвтайм по умолчанию, здоровье 50-80%
  ]
```

Для лайвтайма значение устанавливается в секундах и должно быть больше нуля.
Если указать ноль или меньше - будет применено значение из настроек экономики.

---

## waveSystem <Badge type="warning" text="2.0" title="Добавлено в версии 2.0" />

`waveSystem` - Настройка системы волн спавна. При включении стандартная логика спавна подопечных
отключается, и управление полностью делегируется системе волн.

Если `waveSystem` не указан или `enabled` равно `false`, используется стандартный режим спавна
(параметры [slaves](#slaves), [spawnCount](#spawncount) и т.д.).

::: tip
При включённой системе волн поле [slaves](#slaves) на уровне босса игнорируется -
подопечные настраиваются отдельно для каждой волны.
:::

Пример структуры:

```json
"waveSystem": {
"enabled": true,
"notificationRadius": 200.0,
"notificationIcon": "",
"delayBetweenWaves": "10-15",
"countdownInterval": 5,
"countdownFinalSeconds": 5,
"cleanSlavesBetweenWaves": true,
"afterAllWaves": "none",
"messages": {...},
"waves": [
...
]
}
```

---

### enabled

`enabled` - Включение или отключение системы волн для данного босса.

- `true` - система волн активна, стандартный спавн отключён.
- `false` - используется стандартный режим спавна.

Пример: `"enabled": true,`

### notificationRadius

`notificationRadius` - Радиус в метрах, в котором игроки будут получать уведомления о волнах.

Если указать `0` - уведомления будут отключены.

Пример: `"notificationRadius": 200.0,`

### notificationIcon

`notificationIcon` - Иконка, отображаемая в уведомлениях о волнах.

По умолчанию используется иконка черепа (`set:dayz_gui image:iconSkull`).
Пустая строка отключает иконку.

Примеры:

```
"notificationIcon": "set:dayz_gui image:iconSkull", - иконка черепа (по умолчанию)
"notificationIcon": "",                              - без иконки
```

### delayBetweenWaves

`delayBetweenWaves` - Задержка между завершением одной волны и началом следующей в секундах.

Указывается через чёрточку, тогда будет выбрано случайное число.

Примеры:

```
"delayBetweenWaves": "10-15", - задержка от 10 до 15 секунд
"delayBetweenWaves": "5",     - задержка 5 секунд
```

### countdownInterval

`countdownInterval` - Интервал в секундах, с которым игрокам будут отправляться уведомления
с обратным отсчётом до следующей волны.

Если указать `0` - промежуточные уведомления обратного отсчёта будут отключены.

Пример: `"countdownInterval": 5,`

### countdownFinalSeconds

`countdownFinalSeconds` - За сколько секунд до начала следующей волны начнётся непрерывный
обратный отсчёт (уведомление каждую секунду).

Пример: `"countdownFinalSeconds": 5,`

### cleanSlavesBetweenWaves <Badge type="warning" text="2.0" title="Добавлено в версии 2.0" />

`cleanSlavesBetweenWaves` - Удаление живых подопечных при завершении волны.

- `false` - живые подопечные переносятся в следующую волну и учитываются
  в условиях завершения (`allDead`, `remainingAlive`) (по умолчанию).
- `true` - подопечные удаляются при завершении каждой волны.

Пример: `"cleanSlavesBetweenWaves": false,`

### afterAllWaves

`afterAllWaves` - Поведение босса после завершения всех волн.

Доступные значения:

- `"none"` - ничего не происходит, босс продолжает жить.
- `"restart"` - волны начинаются заново с первой.
- `"die"` - босс умирает через 3 секунды после завершения последней волны.

Пример: `"afterAllWaves": "none",`

### messages <Badge type="warning" text="2.0" title="Добавлено в версии 2.0" />

`messages` - Настраиваемые тексты уведомлений системы волн. Позволяет локализовать или
переопределить сообщения об обратном отсчёте, старте волны, завершении всех волн и рестарте.

Если блок не указан, используются значения по умолчанию (русские строки).

Поддерживаемые плейсхолдеры (подставляются автоматически):

- `{current}` - номер текущей волны (начиная с 1).
- `{total}` - общее количество волн.
- `{seconds}` - оставшееся количество секунд до начала волны.

| Поле                      | Назначение                                                       | По умолчанию                             |
|---------------------------|------------------------------------------------------------------|------------------------------------------|
| `firstWaveCountdownTitle` | Заголовок отсчёта до ПЕРВОЙ волны                                | `Волна 1 из {total}`                     |
| `firstWaveCountdownText`  | Текст отсчёта до ПЕРВОЙ волны                                    | `До начала первой волны: {seconds} сек.` |
| `waveCountdownTitle`      | Заголовок отсчёта между волнами                                  | `Волна {current} из {total}`             |
| `waveCountdownText`       | Текст отсчёта между волнами                                      | `До следующей волны: {seconds} сек.`     |
| `waveStartTitle`          | Заголовок старта волны, когда у волны пустой `notificationTitle` | `Волна {current} из {total}`             |
| `allCompletedTitle`       | Заголовок при завершении всех волн                               | `Все волны пройдены!`                    |
| `allCompletedText`        | Текст при завершении всех волн                                   | _(пусто)_                                |
| `restartText`             | Текст при рестарте волн (`afterAllWaves=restart`)                | `Волны начинаются заново!`               |

Пример:

```json
"messages": {
"firstWaveCountdownTitle": "Волна 1 из {total}",
"firstWaveCountdownText": "До начала первой волны: {seconds} сек.",
"waveCountdownTitle": "Волна {current} из {total}",
"waveCountdownText": "До следующей волны: {seconds} сек.",
"waveStartTitle": "Волна {current} из {total}",
"allCompletedTitle": "Все волны пройдены!",
"allCompletedText": "",
"restartText": "Волны начинаются заново!"
}
```

---

## Настройка волны <Badge type="warning" text="2.0" title="Добавлено в версии 2.0" />

Каждая волна - это элемент массива `waves` внутри `waveSystem`. Волны выполняются последовательно,
от первой к последней.

::: tip
Ниже описаны параметры одной волны.
:::

### slaves

`slaves` - Список класснеймов подопечных для данной волны.

Формат такой же, как и в [основном поле slaves](#slaves) босса - через разделитель `|` можно указать
шанс спавна, лайвтайм и здоровье.

Пример:

```json
"slaves": [
"ZmbM_CitizenASkinny_Blue|0.3|-3|10-50",
"ZmbM_CitizenBFat_Red|0.3|-3|5-10"
]
```

### spawnCount

`spawnCount` - Количество подопечных, которые будут появляться за одну волну.

Указывается через чёрточку, тогда будет выбрано случайное число.

Пример: `"spawnCount": "5-10",`

### spawnRadius

`spawnRadius` - Радиус спавна подопечных вокруг босса для данной волны в метрах.

Если оставить пустую строку `""`, будет использован радиус из основного параметра [spawnRadius](#spawnradius)
босса.

Указывается через чёрточку для случайного значения.

Примеры:

```
"spawnRadius": "15-25", - радиус от 15 до 25 метров
"spawnRadius": "",      - используется радиус босса
```

### completionCondition

`completionCondition` - Условие завершения волны. Если не указано, волна не завершится автоматически.

Содержит два поля:

#### type

Тип условия завершения:

- `"allDead"` - волна завершается, когда все подопечные убиты.
- `"timer"` - волна завершается по истечении заданного времени (значение в секундах указывается в поле `value`).
- `"remainingAlive"` - волна завершается, когда количество живых подопечных становится меньше или равно
  указанному в поле `value`.
- `"masterHealth"` <Badge type="warning" text="2.0" title="Добавлено в версии 2.0" /> - волна завершается,
  когда здоровье босса падает до указанного процента.

#### value

Значение для условий `timer` и `remainingAlive`:

- Для `timer` - время в секундах (должно быть больше `0`).
- Для `remainingAlive` - максимальное количество живых подопечных (должно быть `>= 0`).
- Для `allDead` - не используется.
- Для `masterHealth` - порог здоровья босса в процентах (от `1` до `99`).

Пример:

```json
"completionCondition": {
"type": "timer",
"value": 60
}
```

Примеры для разных типов:

```
Все убиты:
"completionCondition": { "type": "allDead", "value": 0 }

Таймер 60 секунд:
"completionCondition": { "type": "timer", "value": 60 }

Осталось не более 2 живых:
"completionCondition": { "type": "remainingAlive", "value": 2 }

Здоровье босса упало до 50%:
"completionCondition": { "type": "masterHealth", "value": 50 }
```

### notificationTitle

`notificationTitle` - Заголовок уведомления при старте волны.

Если оставить пустую строку, будет использован заголовок по умолчанию: `"Волна X из Y"`.

Поддерживаются плейсхолдеры:

- `{current}` - номер текущей волны.
- `{total}` - общее количество волн.

Пример: `"notificationTitle": "Волна {current}/{total} - Зомби!",`

### notificationText

`notificationText` - Текст уведомления при старте волны.

Если оставить пустую строку, текст уведомления будет пустым.

Поддерживаются те же плейсхолдеры `{current}` и `{total}`.

Пример: `"notificationText": "Приготовьтесь!",`

### startCondition <Badge type="warning" text="2.0" title="Добавлено в версии 2.0" />

`startCondition` - Условие досрочного старта волны. Позволяет запустить следующую волну до завершения текущей
по её [completionCondition](#completioncondition).

Если условие следующей волны срабатывает, текущая волна принудительно завершается, и следующая волна начинается
без задержки между волнами.

Имеет смысл только для волн с индексом > 0 (вторая и далее).

Формат аналогичен [completionCondition](#completioncondition) - объект с полями `type` и `value`.

Поддерживаемый тип:

- `"masterHealth"` - волна запускается, когда здоровье босса падает до указанного %.
  Значение `value` - порог здоровья в % (от `1` до `99`).

Пример:

```json
"startCondition": {
"type": "masterHealth",
"value": 50
}
```

```
Волна 1 имеет completionCondition: { "type": "timer", "value": 120 }
Волна 2 имеет startCondition: { "type": "masterHealth", "value": 50 }

Если здоровье босса упадёт до 50% до истечения таймера 120 секунд,
волна 1 будет принудительно завершена и начнётся волна 2.
```

### spawnBatch (волна) <Badge type="warning" text="2.0" title="Добавлено в версии 2.0" />

`spawnBatch` - Настройка порционного спавна для конкретной волны. Формат такой же, как
[spawnBatch на уровне босса](#spawnbatch).

Если указан - переопределяет `spawnBatch` уровня босса для данной волны.
Если не указан - используется `spawnBatch` уровня босса (если задан).

Пример:

```json
"spawnBatch": {
"size": 2,
"delay": "1-3"
}
```

---

## Готовые примеры для быстрого старта

Ниже - компактные примеры под конкретные механики. Их можно скопировать как отдельный элемент
списка [masters](#masters) (всё, что между `{ }` одного босса).

### Минимальная система волн (2 волны)

Медведь: первая волна - волки (пока всех не убьют), вторая волна - зомби (держатся 60 секунд).
После обеих волн ничего не происходит ([afterAllWaves](#afterallwaves) по умолчанию `none`).

```json
{
  "master": "Animal_UrsusArctos",
  "masterAggressiveLevel": 3,
  "waveSystem": {
    "enabled": 1,
    "waves": [
      {
        "slaves": [
          "Animal_CanisLupus_White",
          "Animal_CanisLupus_Grey"
        ],
        "spawnCount": "3-5",
        "completionCondition": {
          "type": "allDead"
        }
      },
      {
        "slaves": [
          "ZmbM_CitizenASkinny_Blue",
          "ZmbM_CitizenBFat_Red"
        ],
        "spawnCount": "5-8",
        "completionCondition": {
          "type": "timer",
          "value": 60
        }
      }
    ]
  }
}
```

### Спавн за спиной игрока (без волн)

Механик: вокруг него появляются зомби как обычно, а если игрок стреляет по нему с 50+ метров -
за спиной игрока дополнительно вырастают ещё зомби.

```json
{
  "master": "ZmbF_MechanicNormal_Beige",
  "masterAggressiveLevel": 0,
  "spawnRadius": "8-15",
  "spawnCount": "2-3",
  "spawnCoolDown": "15",
  "slaves": [
    "ZmbM_CitizenASkinny_Blue",
    "ZmbM_CitizenBFat_Red"
  ],
  "behindSpawn": {
    "enabled": 1,
    "minTriggerDistance": 50,
    "spawnDistance": "10-15",
    "spawnCount": "1-2",
    "chance": 0.7,
    "cooldown": "15-30"
  }
}
```

### В чём разница: completionCondition и startCondition

Эти два параметра легко перепутать. Коротко:

- [completionCondition](#completioncondition) - **когда ТЕКУЩАЯ волна ЗАКАНЧИВАЕТСЯ**.
- [startCondition](#startcondition) - **когда СЛЕДУЮЩАЯ волна может НАЧАТЬСЯ ДОСРОЧНО**
  (до того, как текущая закончится по своему `completionCondition`).

::: tip Пример хода боя
Волна 1 (волки): `completionCondition = { "type": "timer", "value": 120 }`
Волна 2 (зомби): `startCondition = { "type": "masterHealth", "value": 50 }`

Возможны два пути:

- **Медленный бой:** 120 секунд прошло → волна 1 завершается → пауза
  ([delayBetweenWaves](#delaybetweenwaves)) → стартует волна 2.
- **Быстрый бой:** игроки опустили здоровье босса до 50% уже за 40 секунд → волна 1
  **прерывается** → волна 2 начинается **сразу**, без паузы.
  :::

---

## Пример полной конфигурации с системой волн

```json
{
  "master": "Animal_UrsusArctos",
  "masterAggressiveLevel": 3,
  "masterNoDamageIfSlavesAlive": 0,
  "masterDamageCoef": 0.5,
  "spawnIfMasterSilent": 0,
  "spawnRadius": "10-20",
  "spawnFirstDelay": "5-10",
  "spawnCountLimit": 0,
  "spawnCount": "1-2",
  "spawnCountFirstTime": "3-5",
  "spawnCoolDown": "10-15",
  "cleanDeadSlaves": 2,
  "cleanSlavesOnWin": 3,
  "cleanSlavesOnFocusLoss": 0,
  "killSlavesBeforeClean": 1,
  "playerCountRadius": 150.0,
  "playerCountMultipliers": [
    {
      "players": 1,
      "coef": 1.0
    },
    {
      "players": 3,
      "coef": 1.5
    },
    {
      "players": 5,
      "coef": 2.0
    }
  ],
  "spawnBatch": {
    "size": 3,
    "delay": "2-4"
  },
  "behindSpawn": {
    "enabled": true,
    "minTriggerDistance": 50.0,
    "spawnDistance": "10-15",
    "spawnSpread": "3-5",
    "spawnCount": "1-2",
    "chance": 0.7,
    "cooldown": "15-30",
    "maxActivations": 0,
    "addToSlavesMap": true
  },
  "waveSystem": {
    "enabled": true,
    "notificationRadius": 200.0,
    "notificationIcon": "",
    "delayBetweenWaves": "10-15",
    "countdownInterval": 5,
    "countdownFinalSeconds": 5,
    "cleanSlavesBetweenWaves": true,
    "afterAllWaves": "restart",
    "messages": {
      "firstWaveCountdownTitle": "Волна 1 из {total}",
      "firstWaveCountdownText": "До начала первой волны: {seconds} сек.",
      "waveCountdownTitle": "Волна {current} из {total}",
      "waveCountdownText": "До следующей волны: {seconds} сек.",
      "waveStartTitle": "Волна {current} из {total}",
      "allCompletedTitle": "Все волны пройдены!",
      "allCompletedText": "",
      "restartText": "Волны начинаются заново!"
    },
    "waves": [
      {
        "slaves": [
          "Animal_CanisLupus_White",
          "Animal_CanisLupus_Grey"
        ],
        "spawnCount": "3-5",
        "spawnRadius": "",
        "completionCondition": {
          "type": "masterHealth",
          "value": 70
        },
        "notificationTitle": "Волна {current}/{total}",
        "notificationText": "Волки приближаются!"
      },
      {
        "slaves": [
          "ZmbM_CitizenASkinny_Blue|0.3|-3|10-50",
          "ZmbM_CitizenBFat_Red|0.3|-3|5-10"
        ],
        "spawnCount": "5-10",
        "spawnRadius": "15-25",
        "completionCondition": {
          "type": "timer",
          "value": 60
        },
        "startCondition": {
          "type": "masterHealth",
          "value": 30
        },
        "spawnBatch": {
          "size": 2,
          "delay": "1-3"
        },
        "notificationTitle": "Волна {current}/{total} - Зомби!",
        "notificationText": ""
      }
    ]
  }
}
```
