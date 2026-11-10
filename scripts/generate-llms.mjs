// Генератор llms.txt и llms-full.txt для интеграции с GitMCP (https://gitmcp.io/MPG-DayZ/mpg-docs).
// Запуск: pnpm gen:llms (или автоматически через pre-commit хук lefthook).
// Описания и порядок модов берутся из features на главной (src/index.md),
// порядок страниц внутри мода — из сайдбара (src/.vitepress/sidebar.ts).

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const SITE_URL = 'https://docs.mpg-dayz.ru';
const REPO_URL = 'https://github.com/MPG-DayZ/mpg-docs';
const QUOTE =
  `Документация по серверным и клиентским модам MPG для игры DayZ; все моды настраиваются через JSON-конфиги. ` +
  `Сайт: ${SITE_URL} · Репозиторий: ${REPO_URL}`;

/** Читает файл в UTF-8 и нормализует концовки строк (репозиторий может быть вычекнут с CRLF). */
const readText = (file) => readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

/** Убирает YAML-frontmatter (блок между двумя `---` в начале файла). */
const stripFrontmatter = (text) => {
  const match = /^---\n[\s\S]*?\n---\n?/.exec(text);
  return match ? text.slice(match[0].length) : text;
};

/** Первый H1 без разметки <Badge ... /> — заголовок страницы. */
const getH1 = (text) => {
  const match = /^#\s+(.+)$/m.exec(stripFrontmatter(text));
  return match ? match[1].replace(/\s*<Badge[^>]*\/>/g, '').trim() : '';
};

/** Описания и порядок модов из frontmatter главной страницы (блок features). */
const parseFeatures = (text) => {
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!frontmatter) return [];

  const features = [];
  let inFeatures = false;
  for (const line of frontmatter[1].split('\n')) {
    if (!inFeatures) {
      if (line === 'features:') inFeatures = true;
      continue;
    }
    // Ключ верхнего уровня — блок features закончился
    if (/^\S/.test(line)) inFeatures = false;

    const title = /^\s*-\s+title:\s*(.+)$/.exec(line);
    if (title) {
      features.push({ title: title[1].trim(), link: '', description: '' });
      continue;
    }
    const link = /^\s+link:\s*(\S+)\s*$/.exec(line);
    if (link && features.length > 0) {
      features.at(-1).link = link[1];
      continue;
    }
    const linkText = /^\s+linkText:\s*(.+)$/.exec(line);
    if (linkText && features.length > 0) {
      features.at(-1).description = linkText[1].trim();
    }
  }
  return features.filter((feature) => feature.link !== '');
};

/** Порядок и заголовки страниц мода из объектов сайдбара вида { text: '...', link: '...' }. */
const parseSidebar = (ts) => {
  const items = [];
  const re = /\{\s*text:\s*'([^']+)',\s*link:\s*'([^']+)'\s*\}/g;
  for (const match of ts.matchAll(re)) {
    const link = match[2];
    items.push({ text: match[1], link, dir: link.split('/')[1] ?? '', file: linkToFile(link) });
  }
  return items;
};

/** Ссылка VitePress → путь к md-файлу: '/spawner/' → 'spawner/index.md', '/spawner/quickstart' → 'spawner/quickstart.md'. */
const linkToFile = (link) => {
  const clean = link.startsWith('/') ? link.slice(1) : link;
  return clean.endsWith('/') ? `${clean}index.md` : `${clean}.md`;
};

/** Все md-файлы в src/ (пути относительно src, с прямым слэшем), кроме главной index.md. */
const collectPages = (dir) => {
  const pages = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.vitepress') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...collectPages(full));
    } else if (entry.name.endsWith('.md')) {
      const relative = path.relative(SRC, full).split(path.sep).join('/');
      if (relative !== 'index.md') pages.push(relative);
    }
  }
  return pages;
};

const srcIndex = readText(path.join(SRC, 'index.md'));
const sidebarTs = readText(path.join(SRC, '.vitepress', 'sidebar.ts'));
const allPages = collectPages(SRC);

// Сборка модов: порядок и описания — с главной, недостающие директории добавляются в конец с предупреждением
const mods = parseFeatures(srcIndex).map((feature) => ({ ...feature, dir: feature.link.split('/')[1] ?? '' }));
const knownDirs = new Set(mods.map((mod) => mod.dir));
const extraDirs = [...new Set(allPages.map((page) => page.split('/')[0]))].filter((dir) => !knownDirs.has(dir)).sort();
for (const dir of extraDirs) {
  const indexContent = readText(path.join(SRC, dir, 'index.md'));
  mods.push({ title: getH1(indexContent) || dir, link: '', description: '', dir });
  console.warn(`[generate-llms] Мод «${dir}» отсутствует в features на главной — добавлен в конец списка`);
}

// Страницы каждого мода: сначала сайдбар, потом остальные файлы (index.md первым, дальше по алфавиту)
const sidebarItems = parseSidebar(sidebarTs);
for (const mod of mods) {
  const fromSidebar = sidebarItems
    .filter((item) => item.dir === mod.dir && allPages.includes(item.file))
    .map((item) => ({ file: item.file, title: item.text }));
  const used = new Set(fromSidebar.map((page) => page.file));
  const rest = allPages
    .filter((page) => page.startsWith(`${mod.dir}/`) && !used.has(page))
    .sort((a, b) => {
      const indexA = a.endsWith('/index.md') ? 0 : 1;
      const indexB = b.endsWith('/index.md') ? 0 : 1;
      return indexA - indexB || a.localeCompare(b);
    })
    .map((file) => ({ file, title: getH1(readText(path.join(SRC, file))) || file }));
  mod.pages = [...fromSidebar, ...rest];
}

/** llms.txt — карта документации со ссылками на исходные файлы (пути нужны GitMCP для fetch по файлу). */
const buildLlmsTxt = () => {
  const lines = [
    '# MPG Mods',
    '',
    `> ${QUOTE}`,
    '',
    '## Обзор',
    '',
    '- [Список всех модов](src/index.md): главная страница документации',
  ];
  for (const mod of mods) {
    lines.push('', `## ${mod.title}`, '');
    if (mod.description !== '') lines.push(mod.description, '');
    for (const page of mod.pages) {
      lines.push(`- [${page.title}](src/${page.file})`);
    }
  }
  return `${lines.join('\n')}\n`;
};

/** llms-full.txt — полный текст всех страниц одним файлом, перед каждой — путь к исходнику. */
const buildLlmsFullTxt = () => {
  const sep = '='.repeat(80);
  const parts = [
    '# MPG Mods',
    '',
    `> ${QUOTE}`,
    '',
    'Полный текст документации в одном файле. Перед каждой страницей указан путь к исходному файлу в репозитории.',
  ];
  for (const mod of mods) {
    parts.push('', `## ${mod.title}`);
    if (mod.description !== '') parts.push('', mod.description);
    for (const page of mod.pages) {
      const content = stripFrontmatter(readText(path.join(SRC, page.file))).trim();
      parts.push('', sep, page.file, sep, '', content);
    }
  }
  return `${parts.join('\n')}\n`;
};

writeFileSync(path.join(ROOT, 'llms.txt'), buildLlmsTxt());
writeFileSync(path.join(ROOT, 'llms-full.txt'), buildLlmsFullTxt());

const totalPages = mods.reduce((sum, mod) => sum + mod.pages.length, 0);
console.log(`[generate-llms] Готово: ${mods.length} модов, ${totalPages} страниц → llms.txt, llms-full.txt`);
