---
aside: true
---

# AI_Bandits интеграция

[MPG_Spawner_AIBandits](https://steamcommunity.com/sharedfiles/filedetails/?edit=true&id=3755496624) - bridge-мод, позволяющий спавнить **ботов из стороннего мода AI_Bandits** через триггеры MPG_Spawner. В отличие от эталонной интеграции SpawnerBubaku (где боты «спавнятся и забываются»), здесь боты - **полноценные сущности MPG_Spawner**: они участвуют в условии «победы» триггера, очищаются при выходе/расписании/перезагрузке конфига, входят в `spawnCountLimit`

## Требования

- Установленные моды в load order (порядок важен): **`AI_Bandits`** → **`MPG_Spawner`** → **`MPG_Spawner_AIBandits`**.
- В `DynamicAIB.json` (конфиг AI_Bandits) должна быть группа с именем, совпадающим с `groupName` группы MPG_Spawner, на которую ссылается точка (`GroupLocations[].name`).

::: warning Без AI_Bandits
Если `MPG_Spawner_AIBandits` загружен, а `AI_Bandits` - нет, PBO bridge-мода пропускается движком (через `requiredAddons`). Ошибок не будет, но боты не появятся.
:::

## Как настроить точку

Боты спавнятся через **группы спавна** (см. [Группы спавна](./groups.md)). Создайте группу с флагом `isAiBandits: true` - её `groupName` должно совпадать с `GroupLocations[].name` в `DynamicAIB.json` (мод AI_Bandits). Состав ботов (лут/одежда/фракция/оружие) настраивается в `DynamicAIB.json`; конфиг группы задаёт только имя и условия.

На группу ссылаются из `spawnList` точки префиксом `@` (как на любую группу спавна). Условия группы (`spawnTime`/`weather`/`chance`/`isDisabled`/`spawnOnce`) применяются к бандитской группе наравне с обычными.

### Конфиг группы бандитов (`$profile:MPG_Spawner/Groups/AIBandits.json`)

```json
[
  {
    "groupName": "TestGroup",
    "isAiBandits": true,
    "isDisabled": false,
    "spawnTime": "0-24",
    "chance": 1.0,
    "weather": [],
    "spawnList": []
  }
]
```

::: warning spawnList у бандитской группы игнорируется
`spawnList` у группы с `isAiBandits: true` **не используется** - состав ботов берётся из `DynamicAIB.json`. Мод напишет `WARN` при загрузке, если он задан.
:::

### Пример: только боты (bot-only)

```json
{
  "pointId": 9001,
  "triggerPosition": "6500 0 2500|0 0 0",
  "triggerRadius": "20",
  "triggerHeight": "10",
  "spawnPositions": ["6510 0 2510|0 0 0"],
  "spawnCountLimit": 10,
  "triggerDisableOnWin": true,
  "clearDeathZombies": 120,
  "spawnList": ["@TestGroup"]
}
```

В этом режиме `spawnList` содержит только `@group`-ссылку на бандитов → обычный спавн (животные/зомби/лут) пропускается, появляется только группа ботов.

### Пример: разные группы бандитов в одной точке

```json
{
  "pointId": 9003,
  "triggerPosition": "6500 0 2500|0 0 0",
  "triggerRadius": "30",
  "spawnPositions": ["6510 0 2510|0 0 0"],
  "spawnCountLimit": 20,
  "spawnList": ["@dayBandits", "@nightBandits"]
}
```

Группы `@dayBandits` (`spawnTime: "6-18"`) и `@nightBandits` (`spawnTime: "18-6"`) - обе с `isAiBandits: true`. Днём спавнится `dayBandits`, ночью - `nightBandits`. Все прошедшие условия группы спавнятся целиком в одном цикле.

### Пример: микс - боты + живность

```json
{
  "pointId": 9002,
  "triggerPosition": "6500 0 2500|0 0 0",
  "triggerRadius": "30",
  "spawnPositions": ["6510 0 2510|0 0 0"],
  "spawnCountLimit": 15,
  "spawnList": [
    "@BanditCamp",
    "ZmbF_MechanicNormal_Beige|0.5",
    "Animal_CanisLupusGrey|0.3"
  ]
}
```

Заспавнятся и группа ботов (`BanditCamp`), и зомби/животные из прямых класснеймов. Победа триггера - когда убиты **все** (боты + существа).

## Поведение

| Параметр | Для ботов |
|----------|-----------|
| **Победа** | Все боты точки убиты → `OnTriggerWin` + notification. При `triggerDisableOnWin: true` триггер отключается. |
| **`spawnCountLimit`** | Уважается: повторный спавн группы блокируется, пока живы боты (нельзя накапливать бесконечные волны). |
| **`clearDeathZombies`** | Используется как таймер удаления трупов ботов (в секундах). |
| **Очистка при выходе/расписании** | Работает (`triggerCleanupOnLeave`, lunchtime и т.д.) - боты удаляются вместе с группой AI_Bandits. |
| **`spawnMin`/`spawnMax`** | **Игнорируются** для ботов - группа спавнится целиком, кол-во берётся из `DynamicAIB.json`. |
| **Entity-labels** | Работают (боты регистрируются как обычные существа). |

## Важные нюансы

::: warning Тайминг старта
AI_Bandits загружает конфиг и инициализирует менеджер ~30с после старта сервера (через `RunAIBLater`). Если игрок зайдёт в триггер в первые ~30с - спавн молча пропускается (`DynamicAIBConfig not loaded yet` в логах), точка не ломается. После перезагода/cooldown повторный заход сработает нормально.
:::

::: tip Неизвестная группа
Если `groupName` бандитской группы (на которую ссылается точка через `@group`) отсутствует в `DynamicAIB.json` - в логах появится предупреждение `group 'X' not found or empty`, ботов не будет, точка не сломается.
:::

## Логи

Bridge пишет в лог MPG_Spawner с префиксом `[MPG_AIBandits]`:
- `Init: subscribed to MPG_Spawner events` - успешная инициализация.
- `Registered N bot(s) for point X` - боты зарегистрированы в учёте.
- `OnDespawn: removed bot from group, pointId=X` - бот удалён, группа AI_Bandits почищена.
- `WARN: DynamicAIBConfig not loaded yet...` - ранний вызов (см. тайминг выше).
- `WARN: group 'X' not found or empty for point Y` - нет такой группы.
- `Config reloaded: cleared tracker and stale groups` - перезагрузка конфига.
