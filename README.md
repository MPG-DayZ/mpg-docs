# mpg-docs

Документация по модам MPG для DayZ. Публичная версия: [docs.mpg-dayz.ru](https://docs.mpg-dayz.ru)

## Моды

Все моды настраиваются через JSON-конфиги:

- [MPG_Spawner](https://docs.mpg-dayz.ru/spawner/) — гибко настраиваемый спавнер для живности, лута и маппинга по триггерам
- [MPG_BossHorde](https://docs.mpg-dayz.ru/boss-horde/) — делаем любого зомби или животного боссом со своими подопечными
- [MPG_TDM_Logs](https://docs.mpg-dayz.ru/tdm-logs/) — логи для действий игроков с предметами (взятие, сброс, перемещение)
- [MPG_DamageRadius](https://docs.mpg-dayz.ru/damage-radius/) — дополнительный урон по персонажу, если он близко к животному или зомби
- [MPG_CheckLifeTime](https://docs.mpg-dayz.ru/check-lifetime/) — мод с админской книжкой для удобной проверки лайвтайма предметов
- [MPG_AntiDropArmband](https://docs.mpg-dayz.ru/anti-drop-armband/) — повязка, которая не даёт предмету выпасть из рук при потере сознания
- [MPG_MagnetArmband](https://docs.mpg-dayz.ru/magnet-armband/) — повязка, которая помогает быстро собрать лут в определённом радиусе
- [MPG_BearsPack](https://docs.mpg-dayz.ru/bears-pack/) — пак медведей разного размера, цветов и характеристик
- [MPG_ModsLogger](https://docs.mpg-dayz.ru/mods-logger/) — серверный мод логирования для DayZ-модов
- [MPG_CarFellingTrees2](https://docs.mpg-dayz.ru/car-felling-trees-2/) — серверный мод для валки деревьев любой машиной с настройкой через json

## Подключение к LLM (MCP)

Документация доступна для LLM-агентов через [GitMCP](https://gitmcp.io/MPG-DayZ/mpg-docs) — удалённый MCP-сервер,
который читает `llms.txt` и `llms-full.txt` и умеет точечно загружать нужные страницы. Оба файла генерируются
скриптом (см. `pnpm gen:llms`), ссылки в `llms.txt` ведут на исходные md-файлы репозитория.

Cursor (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "mpg-docs": {
      "url": "https://gitmcp.io/MPG-DayZ/mpg-docs"
    }
  }
}
```

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mpg-docs": {
      "command": "npx",
      "args": ["mcp-remote", "https://gitmcp.io/MPG-DayZ/mpg-docs"]
    }
  }
}
```

Без MCP агенты могут читать страницы напрямую, например
`https://raw.githubusercontent.com/MPG-DayZ/mpg-docs/main/src/spawner/index.md` — пути до всех исходников
перечислены в [llms.txt](llms.txt).

## Разработка

```bash
pnpm install
pnpm work      # dev-сервер VitePress
pnpm build     # сборка сайта в build/
pnpm gen:llms  # регенерация llms.txt и llms-full.txt (также запускается pre-commit хуком)
```

Структура:

- `src/<mod>/` — исходники документации (Markdown + VitePress)
- `src/.vitepress/` — конфигурация сайта: nav, sidebar, тема
- `scripts/` — вспомогательные скрипты
- `build/` — собранный сайт (в `.gitignore`)
