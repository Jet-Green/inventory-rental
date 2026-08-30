/** Правовые документы площадки. Файлы лежат в public/legal/<slug>.md. */
export interface ILegalDoc {
  slug: string;
  title: string;
  summary: string;
}

export const LEGAL_DOCS: ILegalDoc[] = [
  {
    slug: "polzovatelskoe-soglashenie",
    title: "Пользовательское соглашение",
    summary: "Правила использования площадки и соглашение об электронной подписи.",
  },
  {
    slug: "agentskiy-dogovor-oferta",
    title: "Агентский договор-оферта",
    summary: "Условия работы площадки как агента между сторонами аренды.",
  },
  {
    slug: "publichnaya-oferta",
    title: "Публичная оферта",
    summary: "Оферта на услуги площадки для арендатора.",
  },
  {
    slug: "dogovor-arendy",
    title: "Договор аренды (проката)",
    summary: "Шаблон договора между арендодателем и арендатором.",
  },
  {
    slug: "politika-konfidencialnosti",
    title: "Политика конфиденциальности",
    summary: "Как мы обрабатываем персональные данные (152-ФЗ).",
  },
  {
    slug: "soglasie-na-obrabotku-pd",
    title: "Согласие на обработку ПД",
    summary: "Согласие на обработку персональных данных.",
  },
];

export function findLegalDoc(slug: string): ILegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}
