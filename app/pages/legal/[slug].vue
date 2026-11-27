<script setup lang="ts">
import { findLegalDoc } from "~/constants/legalDocs";

const route = useRoute();
const slug = computed(() => String(route.params.slug || ""));
const doc = computed(() => findLegalDoc(slug.value));

const raw = ref("");
const isLoading = ref(true);
const notFound = ref(false);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+?)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+?)`/g, "<code>$1</code>");
}

/** Небольшой markdown → HTML: заголовки, списки, таблицы, цитаты, hr, абзацы. */
function renderMarkdown(md: string): string {
  // HTML-комментарии (дисклеймеры «это шаблон») → оформленная заметка-цитата.
  const prepared = md.replace(/<!--([\s\S]*?)-->/g, (_m, inner: string) =>
    "\n" +
    inner
      .trim()
      .split("\n")
      .map((l) => `> ${l.trim()}`)
      .filter((l) => l !== "> ")
      .join("\n") +
    "\n",
  );
  const lines = prepared.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (!trimmed) { closeLists(); i += 1; continue; }

    // Таблица.
    if (/^\|.*\|$/.test(trimmed) && /^\|[\s:-]+\|$/.test((lines[i + 1] || "").trim())) {
      closeLists();
      const header = trimmed.slice(1, -1).split("|").map((c) => c.trim());
      out.push('<div class="legal-table-wrap"><table><thead><tr>');
      header.forEach((h) => out.push(`<th>${inline(h)}</th>`));
      out.push("</tr></thead><tbody>");
      i += 2;
      while (i < lines.length && /^\|.*\|$/.test((lines[i] || "").trim())) {
        const cells = (lines[i] as string).trim().slice(1, -1).split("|").map((c) => c.trim());
        out.push("<tr>");
        cells.forEach((c) => out.push(`<td>${inline(c)}</td>`));
        out.push("</tr>");
        i += 1;
      }
      out.push("</tbody></table></div>");
      continue;
    }

    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeLists();
      const level = h[1]!.length;
      out.push(`<h${level}>${inline(h[2] || "")}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeLists();
      out.push("<hr />");
      i += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      closeLists();
      out.push(`<blockquote>${inline(trimmed.replace(/^>\s?/, ""))}</blockquote>`);
      i += 1;
      continue;
    }

    const ol = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (ol) {
      if (!inOl) { closeLists(); out.push("<ol>"); inOl = true; }
      out.push(`<li>${inline(ol[2] || "")}</li>`);
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (!inUl) { closeLists(); out.push("<ul>"); inUl = true; }
      out.push(`<li>${inline(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
      i += 1;
      continue;
    }

    closeLists();
    out.push(`<p>${inline(trimmed)}</p>`);
    i += 1;
  }
  closeLists();
  return out.join("\n");
}

const html = computed(() => (raw.value ? renderMarkdown(raw.value) : ""));

onMounted(async () => {
  if (!doc.value) {
    notFound.value = true;
    isLoading.value = false;
    return;
  }
  try {
    raw.value = await $fetch<string>(`/legal/${slug.value}.md`, {
      responseType: "text",
    });
  } catch {
    notFound.value = true;
  } finally {
    isLoading.value = false;
  }
});

useSeoMeta({
  title: () => `${doc.value?.title || "Документ"} — Аренда инвентаря`,
});
</script>

<template>
  <div class="gv-page-wide px-4 px-sm-6 py-8 legal-doc">
    <NuxtLink to="/legal" class="gv-link legal-doc__back mb-4 d-inline-block">
      ← Все документы
    </NuxtLink>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <EmptyState
      v-else-if="notFound"
      title="Документ не найден"
      description="Возможно, ссылка устарела. Вернитесь к списку документов."
      action-title="К документам"
      @action="navigateTo('/legal')"
    />

    <article v-else class="legal-doc__body gv-card-elevated pa-6 pa-sm-8" v-html="html" />
  </div>
</template>

<style scoped>
.legal-doc { max-width: 820px; margin-inline: auto; }

.legal-doc__back {
  font-size: 13px;
}

.legal-doc__body {
  border-radius: 14px;
  background: white;
  line-height: 1.72;
  color: var(--gv-text);
}

.legal-doc__body :deep(h1) {
  font-family: var(--gv-font-display);
  font-size: clamp(1.3rem, 3vw, 2rem);
  overflow-wrap: anywhere;
  font-weight: 800;
  letter-spacing: -0.015em;
  margin: 0 0 16px;
}

.legal-doc__body :deep(h2) {
  font-family: var(--gv-font-display);
  font-size: 1.2rem;
  font-weight: 700;
  margin: 28px 0 10px;
  padding-top: 12px;
  border-top: 1px solid var(--gv-border-light);
}

.legal-doc__body :deep(h3) {
  font-size: 1.02rem;
  font-weight: 700;
  margin: 20px 0 8px;
}

.legal-doc__body :deep(p) {
  margin: 0 0 12px;
  font-size: 16px;
}

.legal-doc__body :deep(ul),
.legal-doc__body :deep(ol) {
  margin: 0 0 14px;
  padding-left: 22px;
  font-size: 16px;
}

.legal-doc__body :deep(li) {
  margin-bottom: 6px;
}

.legal-doc__body :deep(blockquote) {
  margin: 0 0 14px;
  padding: 10px 14px;
  background: var(--gv-primary-soft-bg);
  border-left: 3px solid var(--gv-primary);
  border-radius: 4px;
  font-size: 13px;
  color: var(--gv-text-secondary);
}

.legal-doc__body :deep(hr) {
  border: none;
  border-top: 1px solid var(--gv-border-light);
  margin: 20px 0;
}

.legal-doc__body :deep(code) {
  background: var(--gv-sidebar);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.9em;
}

.legal-doc__body :deep(.legal-table-wrap) {
  overflow-x: auto;
  margin: 0 0 16px;
}

.legal-doc__body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
}

.legal-doc__body :deep(th),
.legal-doc__body :deep(td) {
  border: 1px solid var(--gv-border-light);
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
}

.legal-doc__body :deep(th) {
  background: var(--gv-sidebar);
  font-weight: 700;
}
</style>
