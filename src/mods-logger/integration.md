---
aside: true
---

# Интеграция с MPG_ModsLogger (для разработчиков)

MPG_ModsLogger - опциональный мод: мод-потребитель **работает и без него**. Если админ не установил
`@MPG_ModsLogger`, логирование деградирует до `Print()` в серверный `.RPT`. Если установил - потребитель получает
отдельный файл лога с ротацией.

Подключение строится на прекомпиляторе `#ifdef MPG_ModsLogger`.

## Установка на сервер

Установить мод можно любым, привычным для вас способом, скачав его со Steam.
https://steamcommunity.com/sharedfiles/filedetails/?id=3755713051

Положить `@MPG_ModsLogger` в список `-serverMod=` сервера. Клиенту мод **не нужен**.

```
-serverMod=@MPG_ModsLogger;@YourMod
```

`@MPG_ModsLogger` должен идти **до** модов-потребителей в списке.

## Принцип интеграции

1. **НЕ добавляйте** `MPG_ModsLogger` в `requiredAddons` вашего `config.cpp`. Иначе движок откажется грузить ваш мод,
   если мода нет.
2. Весь доступ к типу `MPG_ModsLogger` оборачивается в `#ifdef MPG_ModsLogger`. Начиная с DayZ 1.21 имя CfgMods-класса
   авто-регистрируется как preprocessor-символ - отдельный `defines[]` не нужен.
3. Константы уровня (`TRACE=1` … `FATAL=6`) захардкожены локально - они не меняются и не требуют `#ifdef`.
4. Весь код пишет через статическую обёртку, **никогда** напрямую к `MPG_ModsLogger`. Это позволит не зависеть от
   логгера как от критической зависимости.

## Шаг 1: обёртка `<PREFIX>_Log.c`

Создайте файл в `Scripts/3_Game/` вашего мода. Замените `MPG_XXX` на ваш префикс. Паттерн: все методы делегируют в
единый `Dispatch`, где и находится единственный `#ifdef`.

```c
// Константы уровня логирования (значения фиксированы, не меняются).
static const int MPG_XXX_LOG_TRACE = 1;
static const int MPG_XXX_LOG_DEBUG = 2;
static const int MPG_XXX_LOG_INFO  = 3;
static const int MPG_XXX_LOG_WARN  = 4;
static const int MPG_XXX_LOG_ERROR = 5;
static const int MPG_XXX_LOG_FATAL = 6;

#ifdef MPG_ModsLogger
  static ref MPG_ModsLogger g_XXX_Logger;
#endif

class MPG_XXX_Log {

  static void Trace(string message)   { Dispatch(MPG_XXX_LOG_TRACE, message); }
  static void Debug(string message)   { Dispatch(MPG_XXX_LOG_DEBUG, message); }
  static void Info(string message)    { Dispatch(MPG_XXX_LOG_INFO,  message); }
  static void Warning(string message) { Dispatch(MPG_XXX_LOG_WARN,  message); }
  static void Error(string message)   { Dispatch(MPG_XXX_LOG_ERROR, message); }
  static void Fatal(string message)   { Dispatch(MPG_XXX_LOG_FATAL, message); }

  // Все методы делегируют сюда. #ifdef - единственное место в файле.
  static void Dispatch(int level, string message) {
#ifdef MPG_ModsLogger
    if (g_XXX_Logger) {
      switch (level) {
        case MPG_XXX_LOG_TRACE: g_XXX_Logger.Trace(message); break;
        case MPG_XXX_LOG_DEBUG: g_XXX_Logger.Debug(message); break;
        case MPG_XXX_LOG_INFO:  g_XXX_Logger.Info(message); break;
        case MPG_XXX_LOG_WARN:  g_XXX_Logger.Warning(message); break;
        case MPG_XXX_LOG_ERROR: g_XXX_Logger.Error(message); break;
        case MPG_XXX_LOG_FATAL: g_XXX_Logger.Fatal(message); break;
        default: break;
      }
      return;
    }
#endif
    // фолбэк, если логгера нет (мод не установлен)
    Print("[YourMod] " + message);
  }
}
```

::: tip Почему константы не под #ifdef
Значения `1..6` фиксированы в enum `MPG_ModsLoggerLevel` мода и никогда не изменятся, поэтому локальный хардкод
безопасен и не требует проверки наличия мода. Fallback - простой `Print` без тега уровня: при отсутствии мода важно
сохранить логику, а не форматирование.
:::

## Шаг 2: создание инстанса в MissionServer

В `Scripts/5_Mission/MissionServer.c`. Логгер создаётся **после** загрузки вашего конфига (чтобы взять из него
`logLevel`), обнуляется в `OnMissionFinish`:

```c
modded class MissionServer {
  override void OnInit() {
    super.OnInit();
    // ... загрузка конфига, Get_YourConfig() ...

    // Создаём логгер после конфига - берём logLevel из него.
#ifdef MPG_ModsLogger
    g_XXX_Logger = new MPG_ModsLogger("YourMod", "$profile:YourMod/Logs", logLevel);
#endif

    // ... остальная инициализация (теперь логгер доступен через XXX_Log) ...
  }

  override void OnMissionFinish() {
#ifdef MPG_ModsLogger
    g_XXX_Logger = null;
#endif
    super.OnMissionFinish();
  }
}
```

- `logLevel` - число 1–6 из вашего конфига (см. таблицу ниже).
- Директория `"$profile:YourMod/Logs"` - куда писать файл `YourMod_Log.log`.

::: warning Конфиг загружается до логгера
Конфиг использует `Print`, а не логгер (логгера ещё нет в момент загрузки конфига). Логгер создаётся после - и берёт
`logLevel` из уже загруженного конфига.
:::

## Шаг 3: используйте обёртку в коде

Везде вызывайте только обёртку - из любого слоя (3_Game / 4_World / 5_Mission):

```c
MPG_XXX_Log.Info("Server started");
MPG_XXX_Log.Warning("Low ammo: " + count.ToString());
MPG_XXX_Log.Error("Config load failed: " + path);
```

Для рантайм-выбора уровня:

```c
MPG_XXX_Log.Dispatch(MPG_XXX_LOG_DEBUG, "detail message");
```

::: warning Никогда напрямую
Не обращайтесь напрямую к `MPG_ModsLogger` или `g_XXX_Logger` вне обёртки и `MissionServer` - иначе мод перестанет
компилироваться без мода.
:::

## Уровни логирования

| Константа                   | Значение | Назначение                              |
|-----------------------------|----------|-----------------------------------------|
| `MPG_ModsLoggerLevel.TRACE` | 1        | Детальная трассировка (каждый шаг)      |
| `MPG_ModsLoggerLevel.DEBUG` | 2        | Отладочная информация                   |
| `MPG_ModsLoggerLevel.INFO`  | 3        | Информационные сообщения (по умолчанию) |
| `MPG_ModsLoggerLevel.WARN`  | 4        | Предупреждения                          |
| `MPG_ModsLoggerLevel.ERROR` | 5        | Ошибки (немедленный flush)              |
| `MPG_ModsLoggerLevel.FATAL` | 6        | Критические ошибки (немедленный flush)  |

Сообщения с уровнем `>= minLevel` пишутся в лог. ERROR/FATAL сбрасывают буфер немедленно.

## Пример минимальной интеграции

Мод `MyMod` с двумя файлами:

**`MyMod/Scripts/3_Game/My_Log.c`** - обёртка из Шага 1 (префикс `MY`).

```c
// Константы уровня логирования (значения фиксированы, не меняются).
static const int MY_LOG_TRACE = 1;
static const int MY_LOG_DEBUG = 2;
static const int MY_LOG_INFO  = 3;
static const int MY_LOG_WARN  = 4;
static const int MY_LOG_ERROR = 5;
static const int MY_LOG_FATAL = 6;

#ifdef MPG_ModsLogger
  static ref MPG_ModsLogger g_MY_Logger;
#endif

class MY_Log {

  static void Trace(string message)   { Dispatch(MY_LOG_TRACE, message); }
  static void Debug(string message)   { Dispatch(MY_LOG_DEBUG, message); }
  static void Info(string message)    { Dispatch(MY_LOG_INFO,  message); }
  static void Warning(string message) { Dispatch(MY_LOG_WARN,  message); }
  static void Error(string message)   { Dispatch(MY_LOG_ERROR, message); }
  static void Fatal(string message)   { Dispatch(MY_LOG_FATAL, message); }

  // Все методы делегируют сюда. #ifdef - единственное место в файле.
  static void Dispatch(int level, string message) {
#ifdef MPG_ModsLogger
    if (g_MY_Logger) {
      switch (level) {
        case MY_LOG_TRACE: g_MY_Logger.Trace(message); break;
        case MY_LOG_DEBUG: g_MY_Logger.Debug(message); break;
        case MY_LOG_INFO:  g_MY_Logger.Info(message); break;
        case MY_LOG_WARN:  g_MY_Logger.Warning(message); break;
        case MY_LOG_ERROR: g_MY_Logger.Error(message); break;
        case MY_LOG_FATAL: g_MY_Logger.Fatal(message); break;
        default: break;
      }
      return;
    }
#endif
    // фолбэк, если логгера нет (мод не установлен)
    Print("[YourMod] " + message);
  }
}
```

**`MyMod/Scripts/5_Mission/MissionServer.c`**:

```c
modded class MissionServer {
  override void OnInit() {
    super.OnInit();
#ifdef MPG_ModsLogger
    g_MY_Logger = new MPG_ModsLogger("MyMod", "$profile:MyMod/Logs", 3);
#endif
    MY_Log.Info("MyMod started");
  }

  override void OnMissionFinish() {
#ifdef MPG_ModsLogger
    g_MY_Logger = null;
#endif
    super.OnMissionFinish();
  }
}
```

## См. также

- [Описание и API](./overview.md) - состав мода, возможности, особенности работы, таблица API.
- [Главная страница](./index.md) - краткое описание и список возможностей.
