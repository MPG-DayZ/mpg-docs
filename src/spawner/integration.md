---
aside: true
---

# Интеграция с MPG_Spawner (для разработчиков)

MPG_Spawner предоставляет публичный events-API и несколько геттеров для сторонних интеграций. Контракт описан в
заголовке `MPG_Spawner/Scripts/4_World/MPG_SpawnerEvents.c`. Ниже - точки расширения, добавленные/используемые
bridge-модом `MPG_Spawner_AIBandits`.

## Доступ к событиям

```c
MPG_Spawner.GetInstance().GetEvents();
```

Возвращает статический контейнер `MPG_SpawnerEvents`. Подписки **переживают перезагрузку конфига / реконструкцию
синглтона** (контейнер - `static`), поэтому подписку достаточно сделать один раз за процесс.

## События

| Событие                      | Сигнатура обработчика                                              | Когда вызывается                                                                                                                                             |
|------------------------------|--------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `OnTriggerEntered`           | `void(int pointId, Man player)`                                    | Игрок вошёл в триггер                                                                                                                                        |
| `OnTriggerLeft`              | `void(int pointId, Man player)`                                    | Игрок покинул триггер                                                                                                                                        |
| `OnSpawn`                    | `void(int pointId, Object spawned, TStringArray itemArr)`          | Заспавнена сущность (животное/зомби/лут)                                                                                                                     |
| `OnDespawn`                  | `void(int pointId, Object spawned)`                                | Сущность удалена из точки (смерть / cleanup / immersive / delete-trigger / reload). **Вызывается во всех путях удаления** (см. `MPG_Spawner.NotifyDespawn`). |
| `OnTriggerWin`               | `void(int pointId, Man killer)`                                    | Все существа точки убиты (победа)                                                                                                                            |
| `OnTriggerFirstSpawn`        | `void(int pointId)`                                                | Первый спавн при заходе в триггер                                                                                                                            |
| `OnTriggerReset`             | `void(int pointId)`                                                | Сброс триггера (inactive-reset)                                                                                                                              |
| `OnTriggerDisabled`          | `void(int pointId)`                                                | Триггер отключён                                                                                                                                             |
| `OnTriggerEnabled`           | `void(int pointId)`                                                | Триггер включён                                                                                                                                              |
| `OnConfigReloaded`           | `void()`                                                           | Конфиг перезагружен (точки удалены и созданы заново)                                                                                                         |
| `OnTriggerBanditsGroupSpawn` | `void(int pointId, string groupName, vector position, Man player)` | Запрос на спавн группы ботов AI_Bandits (для каждой isAiBandits-группы `@groupName` в `spawnList` точки, прошедшей условия). Подписчик сам вызывает AI_Bandits. |

### Пример подписки

```c
void MyHandler(int pointId, string groupName, vector position, Man player) {
  // ...вызвать сторонний спавнер, зарегистрировать ботов в учёте...
}

void Init() {
  MPG_Spawner.GetInstance().GetEvents().OnTriggerBanditsGroupSpawn.Insert(MyHandler);
}
```

## Гейты (вето на срабатывание)

Гейты - обратная сторона событий: bridge-мод может **запретить** срабатывание триггера.

- `MPG_Spawner.GetGates().Register(new MyGate())` - регистрация один раз за процесс
  (переживает config-reload), например в `modded class MissionServer.OnInit`.
- Чекпойнты: `CanSpawn` (перед спавн-циклом), `CanFirstSpawn` (перед FIRST_SPAWN-эффектами),
  `CanWin` (перед WIN-цепочкой, в обоих путях), `CanLeave` (перед leave-реакциями),
  `CanGroupSpawn` (перед разворотом `@group` в пул).
- Контракт: вернуть `false` = заблокировать (заполнить `ctx.blockReason` - попадёт в DEBUG-лог).
  Возвращают `true` по умолчанию - переопределяйте только нужное.
- `ctx.player` может быть `null` в `CanWin`/`CanGroupSpawn`, `ctx.killer` заполнен только в
  `CanWin` - проверяйте перед использованием (игрок гарантированно не `null` только в `CanSpawn`).
- Опционально: точка/группа перечисляет имена гейтов в поле `triggerGates` (AND-семантика);
  имена регистрозависимы. Незарегистрированный гейт - fail-open + WARN (once).
- Кулдаун при блокировке SPAWN не расходуется, `isEntered` не выставляется. Retry: пока гейт
  блокирует и игрок остаётся в зоне, попытка повторяется на каждом stay-тике - у любых точек
  с `triggerGates` (волновые и обычные); `triggerEnterDelay` уважается.
- Свои поля конфига добавляйте через `modded class MPG_Spawner_PointConfig` / `_GroupConfig` -
  JsonFileLoader подхватит их. Примечание: при автопересохранении конфига
  (`ValidateConfig`) ваши поля попадут в JSON точек - это нормально.
- Не гейтятся никогда: вход/выход игрока, события `OnTriggerEntered`/`OnTriggerLeft`,
  входная/выходная нотификации, отмена волн при выходе.

Пример bridge-мода "ранги":

```c
modded class MPG_Spawner_PointConfig {
  string requiredRank = "";  // пусто = гейт не активен на точке
}

class MPG_RanksGate extends MPG_Spawner_TriggerGate {
  override string GetName() { return "mpg_ranks"; }

  override bool CanSpawn(MPG_Spawner_GateContext ctx) {
    MPG_Spawner_PointConfig cfg = MPG_Spawner_PointConfig.Cast(ctx.config);

    if (!cfg || cfg.requiredRank == "") {
      return true;
    }

    PlayerBase player = PlayerBase.Cast(ctx.player);

    // ЗДЕСЬ вызов API вашего мода рангов: по PlainId получить ранг и сравнить.
    string rank = MyRanksApi.GetRank(player.GetIdentity().GetPlainId());

    if (rank != cfg.requiredRank) {
      ctx.blockReason = "rank '" + rank + "' != required '" + cfg.requiredRank + "'";
      NotificationSystem.SendNotificationToPlayerExtended(player, 5,
          cfg.notificationTitle, "Ранг не позволяет: нужно '" + cfg.requiredRank + "'");
      return false;
    }

    return true;
  }
}

modded class MissionServer {
  override void OnInit() {
    super.OnInit();
    MPG_Spawner.GetGates().Register(new MPG_RanksGate());
  }
}
```

## Геттеры

```c
// Конфиг точки (любое поле, включая кастомные).
ref MPG_Spawner_PointConfig cfg = MPG_Spawner.GetInstance().GetTrigger(pointId).GetPointConfig();

// Учёт существ точки (для интеграций, ведущих параллельные структуры).
MPG_Spawner.GetInstance().AddSpawnedInstance(pointId, entity.GetID(), entity, itemArr);
MPG_Spawner.GetInstance().RemoveSpawnedCreature(pointId, entity.GetID(), killer, true, entity);

// Уведомление об удалении - вызвать во всех путях удаления своей сущности ПЕРЕД ObjectDelete,
// чтобы подписчики OnDespawn успели почистить параллельные структуры.
MPG_Spawner.GetInstance().NotifyDespawn(pointId, entity);
```

## `NotifyDespawn` и контракт `OnDespawn`

`OnDespawn` ранее инвокалось только под `#ifdef MPG_SPWNR_DEBUG` (контрактная ловушка - в релизе событие не вызывалось).
Теперь `NotifyDespawn(pointId, entity)` - публичный метод, и MPG_Spawner вызывает его **во всех путях удаления**
существа:

- смерть (`RemoveSpawnedCreature`),
- immersive-удаление (`TryToImmersiveDelete`),
- удаление при перезагрузке конфига / `DeleteTrigger(hard)`.

Интеграция, которая ведёт параллельные структуры (например, группы AI_Bandits), может надёжно подписаться на
`OnDespawn` - колбэк сработает при любом способе удаления существа.

## См. также

- [Конфиг точки](./point-config.md) - все поля `MPG_Spawner_PointConfig`.
- [AI_Bandits интеграция](./ai-bandits.md) - пример bridge-мода на базе этого контракта.
