---
aside: true
---

# Интеграция с MPG_Spawner (для разработчиков)

MPG_Spawner предоставляет публичный events-API и несколько геттеров для сторонних интеграций. Контракт описан в
заголовке `MPG_Spawner/Scripts/4_World/MPG_SpawnerEvents.c`. Ниже — точки расширения, добавленные/используемые
bridge-модом `MPG_Spawner_AIBandits`.

## Доступ к событиям

```c
MPG_Spawner.GetInstance().GetEvents();
```

Возвращает статический контейнер `MPG_SpawnerEvents`. Подписки **переживают перезагрузку конфига / реконструкцию
синглтона** (контейнер — `static`), поэтому подписку достаточно сделать один раз за процесс.

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

## Геттеры

```c
// Конфиг точки (любое поле, включая кастомные).
ref MPG_Spawner_PointConfig cfg = MPG_Spawner.GetInstance().GetTrigger(pointId).GetPointConfig();

// Учёт существ точки (для интеграций, ведущих параллельные структуры).
MPG_Spawner.GetInstance().AddSpawnedInstance(pointId, entity.GetID(), entity, itemArr);
MPG_Spawner.GetInstance().RemoveSpawnedCreature(pointId, entity.GetID(), killer, true, entity);

// Уведомление об удалении — вызвать во всех путях удаления своей сущности ПЕРЕД ObjectDelete,
// чтобы подписчики OnDespawn успели почистить параллельные структуры.
MPG_Spawner.GetInstance().NotifyDespawn(pointId, entity);
```

## `NotifyDespawn` и контракт `OnDespawn`

`OnDespawn` ранее инвокалось только под `#ifdef MPG_SPWNR_DEBUG` (контрактная ловушка — в релизе событие не вызывалось).
Теперь `NotifyDespawn(pointId, entity)` — публичный метод, и MPG_Spawner вызывает его **во всех путях удаления**
существа:

- смерть (`RemoveSpawnedCreature`),
- immersive-удаление (`TryToImmersiveDelete`),
- удаление при перезагрузке конфига / `DeleteTrigger(hard)`.

Интеграция, которая ведёт параллельные структуры (например, группы AI_Bandits), может надёжно подписаться на
`OnDespawn` — колбэк сработает при любом способе удаления существа.

## См. также

- [Конфиг точки](./point-config.md) — все поля `MPG_Spawner_PointConfig`.
- [AI_Bandits интеграция](./ai-bandits.md) — пример bridge-мода на базе этого контракта.
