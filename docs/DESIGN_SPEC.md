# DESIGN_SPEC.md — Дизайн-спецификация «Аренда инвентаря» (gorodaivesi.ru)

Стек: Nuxt 4 + Vuetify 3. Спецификация опирается на реально существующие файлы проекта — не вводит дублирующих сущностей.

---

## 1. ДИЗАЙН-ТОКЕНЫ

### 1.1 Цвета

Все токены объявить в `/app/assets/styles/main.scss` как CSS-переменные. Нигде не использовать значения в обход переменных.

```scss
:root {
  /* --- БРЕНД --- */
  --gv-primary:              #ff6600;   /* CTA-кнопки, цена, активный пункт навигации */
  --gv-primary-soft-bg:      #fff7f0;   /* фон активного nav-пункта, чипов-тегов, баннеров */
  --gv-primary-soft-border:  #ffd1b3;   /* обводка soft-элементов */

  /* --- АКЦЕНТЫ --- */
  --gv-link:     rgba(61, 175, 245, 0.95); /* #3daff5, только ссылки на PDF, вторичные info-метки */
  --gv-available: #bcc662;               /* «доступно N шт.», индикатор свободных дат */

  /* --- ТЕКСТ --- */
  --gv-text:           rgba(0, 0, 0, 0.9);  /* основной текст */
  --gv-text-secondary: rgba(0, 0, 0, 0.55); /* вторичный: мета, подписи */
  --gv-text-muted:     rgba(0, 0, 0, 0.45); /* tagline, placeholder */

  /* --- ПОВЕРХНОСТИ --- */
  --gv-bg-page:    #ffffff;   /* фон body */
  --gv-card-bg:    #fcfcfc;   /* карточки, блоки */
  --gv-sidebar:    #fafafa;   /* сайдбар кабинетов */

  /* --- ГРАНИЦЫ --- */
  --gv-border:       #d9d9d9; /* обводка инпутов в rest-состоянии */
  --gv-border-light: #f0f0f0; /* разделители, border-bottom header */

  /* --- РАДИУСЫ --- */
  --gv-radius-btn:    15px;  /* кнопки, чипы фильтра */
  --gv-radius-card:   16px;  /* карточки */
  --gv-radius-modal:  18px;  /* v-dialog */
  --gv-radius-input:  15px;  /* v-text-field, v-select */
  --gv-radius-thumb:  10px;  /* миниатюры галереи */

  /* --- ТЕНИ --- */
  --gv-shadow-card:   0 8px 28px rgba(0, 0, 0, 0.06);
  --gv-shadow-modal:  0 16px 48px rgba(0, 0, 0, 0.12);
  --gv-shadow-sticky: 0 2px 12px rgba(0, 0, 0, 0.06);

  /* --- ШРИФТЫ --- */
  --gv-font-display: "Nunito", "Montserrat", system-ui, sans-serif;
  --gv-font-body:    "Montserrat", system-ui, sans-serif;
}
```

### Vuetify theme (фрагмент для `/app/plugins/vuetify.ts`)

```ts
colors: {
  primary:    '#ff6600',
  secondary:  '#3daff5',
  success:    '#bcc662',
  background: '#ffffff',
  surface:    '#fcfcfc',
}
variables: { 'border-radius-root': '15px' }
```

Модалки: Vuetify `rounded="xl"` = 28px — нам нужно 18px. Задавать `style="border-radius: 18px"` на `v-card` внутри `v-dialog`, или глобальный класс `.gv-modal { border-radius: 18px !important; }`.

### 1.2 Типографика

| Роль | Семейство | Размер | Вес | LH |
|---|---|---|---|---|
| H1 hero (главная) | Nunito/Montserrat | `clamp(1.75rem, 1.2rem + 2vw, 2.25rem)` | 900 | 1.2 |
| H1 страница объявления | Nunito/Montserrat | `clamp(1.375rem, 1rem + 1.1vw, 1.875rem)` | 900 | 1.25 |
| H1 кабинет / секции | Nunito/Montserrat | `clamp(1.25rem, 0.9rem + 1.2vw, 2rem)` | 900 | 1.3 |
| H2 / section-title | Nunito/Montserrat | 18px | 700 | 1.3 |
| H3 карточка | Montserrat | 16px | 600 | 1.35 |
| Body основной | Montserrat | 14px | 400 | 1.55 |
| Body вторичный / meta | Montserrat | 13px | 400 | 1.5 |
| Caption | Montserrat | 12px | 400–500 | 1.4 |
| Badge / status chip | Montserrat | 11px | 500 | 1 |
| Кнопки | Montserrat | 13px | 600 | 1 |
| Цена (акцент) | Montserrat | 18px | 600 | 1.2 |
| Цена (итог checkout) | Montserrat | 22px | 700 | 1.2 |

`.gv-display` = `font-family: var(--gv-font-display); font-weight: 900;`

### 1.3 Шкала отступов

Только: **4, 8, 12, 16, 20, 24, 28, 32, 40, 48px** (Vuetify spacing helpers). Padding карточки 24px (`pa-6`), компактной 16px (`pa-4`), gap сетки 20px, padding страниц кабинета `px-4 px-sm-6 py-8`, hero `pt-8 pb-12`, gap кнопок 8px (`ga-2`).

### 1.4 Сетка

- max-width контента 1280px (`.page-container` / `.gv-page-wide`)
- Сетка каталога: `repeat(auto-fill, minmax(320px, 1fr)); gap: 20px` (`.card-grid`)
- Сайдбар кабинета 260px (рентер/бизнес), 220px (адмика); при `<960px` — горизонтальная навигация сверху
- Checkout / Верификация / Success: max-width блока 720px, центр
- Страница объявления: `v-row` лев `lg=8` (галерея+инфо), прав `lg=4` (sticky CTA)
- Дашборд stat: `v-col md=4` ×3
- Выбор кабинета: `v-col sm=6` ×2

### 1.5 Анимации

Кнопки hover `background-color/opacity 0.15s ease`, active `scale(0.96)`. Nav-ссылки `0.15s ease`. Карточки hover `box-shadow/transform 0.2s ease`, `translateY(-2px)`. Page transition `opacity 0.12s ease`. Иконочные :active `scale(0.88)`.

### 1.6 Состояния

- Hover primary: bg `#e55a00`. Hover secondary: bg `#fff7f0`.
- Focus input: border `#ff6600`, box-shadow `0 0 0 2px rgba(255,102,0,0.15)`.
- Disabled: `opacity 0.45`, `cursor not-allowed`.
- Loading v-btn: спиннер white (primary) / `#ff6600` (outlined).

---

## 2. ОБЩИЕ КОМПОНЕНТЫ

### 2.1 Кнопки

**Primary:** `color="primary"` + `.gv-cta`, radius 15px, padding `0 20px`, height 40/48px, Montserrat 13px 600 UPPERCASE `letter-spacing 0.02em`, bg `#ff6600` text white, hover `#e55a00`, active `scale(0.96)`, disabled `opacity 0.45`.
**Secondary:** `variant="outlined" color="primary"` + `.gv-cta`, bg white, border `1.5px solid #ff6600`, text `#ff6600`, hover bg `#fff7f0`.
**Text:** `variant="text"`, text `rgba(0,0,0,0.55)` 13px 400 НЕ uppercase, hover `rgba(0,0,0,0.9)`.
**Иконочная:** `icon`, `variant="text"`, `size=40`, radius 999px, active `scale(0.88)`.

```scss
.gv-cta {
  font-size: 13px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.02em !important;
  border-radius: var(--gv-radius-btn) !important;
}
```

### 2.2 Карточки

`.gv-card-elevated`: bg `#fcfcfc`, border `1px solid #f0f0f0`, radius 16px, shadow `0 8px 28px rgba(0,0,0,0.06)`. Hover (каталог): shadow `0 12px 40px rgba(0,0,0,0.10)`, `translateY(-2px)`, `0.2s ease`.

**Карточка каталога (`RentalCard.vue`):** фото 200px (radius 12px, cover, плейсхолдер `#eee`) + body gap 8px; title 16px 600; категории 12px secondary; цена 18px 600 primary; способ 12px `rgba(0,0,0,0.5)`; доступность 12px `#bcc662`; кнопка ВЗЯТЬ block primary; min-height 420px.

### 2.3 Поля и селекты

`variant="outlined" density="comfortable"`, radius 15px. border rest `#d9d9d9`, focus `#ff6600` + box-shadow `0 0 0 2px rgba(255,102,0,0.15)`. label/placeholder 13px muted, input 14px text. Override radius:

```scss
.v-field--variant-outlined .v-field__outline__start { border-radius: 15px 0 0 15px; }
.v-field--variant-outlined .v-field__outline__end   { border-radius: 0 15px 15px 0; }
```

### 2.4 Модалки

`v-dialog max-width` 440/560/720; `v-card` radius 18px, shadow modal, bg white. title Nunito/Montserrat 18px 900 `pa-4 pb-2`; text 14px secondary `pa-4 pt-2`; actions `pa-4 pt-0` gap 8px justify-end.

### 2.5 Чипы статусов (`v-chip size="small" variant="tonal"`)

**Бронь:** Ожидает оплаты `pending`→warning; Оплачено `confirmed`→primary; Активно `active`→success; Завершено `completed`→default; Отменено `cancelled`→error.
**Объявление:** Черновик `draft`→default; На модерации `pending`→warning; Опубликовано `active`→success; Отклонено `rejected`→error; Скрыто `hidden`→default.
**Верификация:** `pending`→warning «На проверке»; `approved`→success «Подтверждена»; `rejected`→error «Отклонена».
Font 11px 500, `text-transform: none`.

### 2.6 Чипы-теги категорий

`.gv-chip-tag`: padding `8px 14px`, radius 15px, bg `#fff7f0`, border `1px solid #ffd1b3`, text `#ff6600` 12px 500, hover border `#ff6600` bg `#ffe8d6`, active `.gv-chip-tag--active` border `2px solid #ff6600`.

### 2.7 Header (`AppHeader.vue`)

3 варианта. **Marketing:** height ~72px, bg white border-bottom `#f0f0f0`; лого Nunito 900 22px → `/`; tagline 12px muted; правая часть: «РАЗМЕСТИТЬ ОБЪЯВЛЕНИЕ» (outlined) + «ВОЙТИ»/«КАБИНЕТ» (primary) + аватар 40px; mobile — бургер → `v-navigation-drawer right width=280`. **Compact:** height 64px, лого 18px + «· Каталог аренды». **Minimal:** только лого 18px.

### 2.8 Кабинетная навигация (sidebar)

Header кабинета: bg white border-bottom `#f0f0f0` `padding 16px 0`; лого 14px 900 + бейдж роли `text-primary 12px 600` + пилюля «Сменить кабинет» (bg `#fff7f0`, padding `8px 12px`, radius 8px, 12px); справа CTA + «Выйти» (text).
Сайдбар: width 260/220px, bg `#fafafa`, border-right `#f0f0f0`, min-height `calc(100vh - 72px)`, `pa-4`.
`.cabinet-nav-link`: block, `pa-3`, radius 8px, mb 4px, 14px 400 `rgba(0,0,0,0.55)`; hover bg `#f5f5f5`; active bg `#fff7f0` text `#ff6600` 600.
Mobile <960px: горизонтальная полоса навигации, scroll.

### 2.9 Переключатель кабинета (`CabinetSelectDialog.vue`)

`v-dialog max-width=560` + `v-card` radius 18px. Две карточки `.gv-card-elevated pa-5` (`v-col sm=6`): иконка 32px `#ff6600`; h3 Nunito 900 16px; описание 14px secondary; кнопка ВОЙТИ block primary; подсказка недоступной роли 11px muted. hover `translateY(-2px)`.

### 2.10 EmptyState / 2.11 Skeleton

EmptyState (`v-card variant=tonal rounded=lg pa-6 text-center`): title 18px 700, desc 14px secondary mb-4, кнопка primary. Skeleton: `v-skeleton-loader type="image, article"` radius 16px.

---

## 3. ПОЭКРАННАЯ СПЕЦИФИКАЦИЯ

### Экран 1. Главная / Каталог (`app/pages/index.vue`, layout default)

Hero `pt-8 pb-6`: H1 `.home-catalog__hero` clamp Nunito 900; tagline 16px secondary mb-6. Поиск: `v-text-field` + «НАЙТИ» (primary 48px) + «ФИЛЬТРЫ» (outlined 48px) + `v-badge` счётчик; row на md+, column mobile. Диалог фильтров: `v-dialog 720` + `RentalFilterBar`, footer Сбросить/Отмена/ПРИМЕНИТЬ. Категории: `.gv-chip-tag` flex-wrap mb-8. Сетка: `.card-grid`, loading 6× skeleton, empty EmptyState «Сбросить». Пагинация: «ПОКАЗАТЬ ЕЩЁ» outlined center mt-8 (если page<totalPages).

### Экран 2. Страница объявления (`rental-item/[id].vue`, header compact)

2 колонки: лев `lg=8` галерея+инфо+календарь, прав `lg=4` sticky CTA. Галерея: `v-img height=420 cover rounded=lg`; миниатюры 96×72 radius 10px, активная border `2px #ff6600`. Инфо `.gv-card-elevated pa-5`: H1 clamp Nunito 900; категории 13px; описание 14px; цена 18px 600 `#ff6600`; мин.срок/доступность(`#bcc662`)/получение 13px. Sticky CTA `.gv-card-elevated pa-6 position:sticky top:16px`: H2 18px 600; цена primary mb-4; «ЗАБРОНИРОВАТЬ» block primary large; ошибка 12px error. Календарь (`RentalCalendar.vue`): 14 дней, ячейка 44×44 radius 8px; свободный bg `#f0f7e0` border `#bcc662` text `#3d6600`; занятый bg `#f5f5f5` line-through; легенда. Loading linear, error/404 EmptyState. <lg: правая колонка вниз.

### Экран 3. Оформление брони (`BookingWizardForm.vue`, header compact, max 720px)

Шаг-индикатор 4 пилюли `.step-pill`/`--active` (border `#ff6600` bg `#fff7f0` 600 активная). **Шаг 1 Период:** `BookingRangeCalendar`, ячейка 40×40 radius 8px (диапазон bg `rgba(255,102,0,0.12)`; края bg `#ff6600` white; занятый bg `#f0f0f0` not-allowed; сегодня border `#ff6600`); время + бейдж дней/суммы. **Шаг 2 Проверка:** карточка оборудования (фото 72px) + параметры 14px с `mdi-`. **Шаг 3 Контакты:** ФИО/телефон/email outlined 15px. **Шаг 4 Оплата:** итог-блок bg `#fff7f0` border `#ffd1b3` radius 12px pad 20px (итого 22px 700 `#ff6600`); 2 `v-checkbox color=primary` (договор / ПД), label 13px ссылки `.gv-link`; подсказка PDF 12px muted `mdi-file-pdf-box`; «ОПЛАТИТЬ» block primary large. Навигация: НАЗАД(outlined)+ДАЛЕЕ/ОПЛАТИТЬ(primary) gap 12px mt-6.

### Экран 4. Успех брони (`booking/success.vue`, header minimal)

`.gv-card-elevated pa-8 max-width 720 mx-auto mt-8`: `mdi-check-circle` 48px `#bcc662`; H1 «Бронь успешно оформлена» Nunito 900; номер 14px 600; детали (оборудование/даты/сумма/способ) 14px secondary gap 8px. Блок «Документы»: bg `#f5f8f0` border `#d4e09a` radius 12px pad 16px; ссылки `.gv-link` `mdi-file-pdf-box` d-block. Подсказка Telegram `mdi-send` 12px muted mb-6. «ПЕРЕЙТИ В КАБИНЕТ» block primary.

### Экран 5. Выбор кабинета (`CabinetSelectDialog.vue` / `/cabinet/select`)

`v-dialog 560` card radius 18px pa-2. Заголовок «Выберите кабинет» Nunito 900 18px; подзаголовок 14px secondary pb-4. Две карточки `v-col sm=6` `.gv-card-elevated pa-5 h-100`: иконка `mdi-account-outline`/`mdi-store-outline` 32px `#ff6600`; h3 Nunito 900 16px; описание 14px secondary flex-grow; «ВОЙТИ» block primary; подсказка недоступной роли 11px muted; hover `translateY(-2px)`. Footer «Закрыть» text. Mobile: `cols=12` стек.

### Экран 6. Кабинет Арендатора (`layouts/renter.vue`)

Навигация: Мои аренды / Документы / Профиль / Верификация / Уведомления. **Мои аренды (`rentals.vue`):** H1 Nunito 900; карточки `.gv-card-elevated pa-5` gap 16px (название 14px 600; «дата—дата · статус» 12px secondary + `v-chip` статус п.2.5; ссылка договор `.gv-link` 12px; «ПОДРОБНЕЕ» outlined small; арендодатель 12px). Loading linear, empty «Бронирований пока нет».

### Экран 7. Кабинет Арендодателя (`layouts/business.vue`)

Навигация: Обзор/Мои объявления/Брони/Календарь/Выплаты/Документы/Верификация/Профиль. Баннер верификации (если `!isBusiness`): `.business-banner` bg `#fff7f0` border `#ffd1b3` radius 12px pad 16px, `mdi-alert-circle-outline` + 14px 600 + «ПРОЙТИ ВЕРИФИКАЦИЮ» primary. Header справа: «ДОБАВИТЬ ОБЪЯВЛЕНИЕ» primary всегда видна. Обзор (`index.vue`): доработать — 3 мини-карточки статистики (брони/выручка/объявления).

### Экран 8. Мои объявления (`business/listings/index.vue`)

Шапка: H1 + «ДОБАВИТЬ ОБЪЯВЛЕНИЕ» primary, `justify-space-between`. Фильтр статуса: `v-chip-group` Все/Черновик/На модерации/Опубликовано/Отклонено/Скрыто (активный `flat color=primary`). Карточка горизонтальная: фото 140×100 radius 8px; название 14px 600; цена+статус 12px; «Активных броней N» 12px; действия РЕДАКТИРОВАТЬ/СКРЫТЬ-ПОКАЗАТЬ(outlined)+КАЛЕНДАРЬ(primary) small `.gv-cta`. Empty + кнопка добавить.

### Экран 9. Создание объявления Wizard (`BusinessListingNewForm.vue`)

6 шагов `.step-pill`. **1 Осн.инфо:** название(req), описание textarea rows4, категории `v-select multiple chips`. **2 Фото:** заменить URL-поля на dropzone — border `2px dashed #d9d9d9` radius 12px pad 32px bg `#fafafa`, hover border `#ff6600` bg `#fff7f0`, `mdi-cloud-upload-outline` 32px + «Перетащите фото или нажмите»; превью сетка 4 кол 80px radius 8px + ✕; макс 5, счётчик «2/5»; скрытый `v-file-input`. **3 Стоимость:** цена(num суффикс ₽), мин.срок(num дней), кол-во(num). **4 Получение:** 3 тогла Самовывоз/Доставка/Оба; адрес самовывоза; зона доставки (условно). **5 Календарь:** `ListingAvailabilityPicker` + предпросмотр диапазонов. **6 Предпросмотр:** `.gv-card-elevated pa-4` итог read-only + «ОТПРАВИТЬ НА МОДЕРАЦИЮ». Навигация НАЗАД(outlined)+ДАЛЕЕ/ОТПРАВИТЬ(primary); НАЗАД на шаге1 disabled. Error 12px красный.

### Экран 10. Верификация Арендодателя (`business-cabinet/verification`)

H1 «Верификация бизнеса» Nunito 900 + подзаголовок 14px. Статус-строка + `v-chip` (п.2.5); если rejected — комментарий модератора 12px error. Переключатель типа Физлицо/ИП/ООО: 3 `v-btn` (выбранная `flat color=primary`, прочие outlined) radius 15px gap 8px mb-6. Поля (max 480px): ФИО/Наименование(req), ИНН(req, ИП/ООО — DaData автоподтяг, индикатор `v-progress-circular size=16`), ОГРН/ОГРНИП(req ИП/ООО), реквизиты выплат(req). Блок DaData (ИП/ООО): bg `#f0f7e0` border `#d4e09a` radius 12px pad 16px — «Найдено: наименование», ОГРН, адрес 13px + кнопка «Использовать» outlined small. «ОТПРАВИТЬ НА ПРОВЕРКУ» primary. После отправки (pending): инфо-блок вместо формы `mdi-clock-outline`.

### Экран 11. Документы (оба кабинета)

`renter-cabinet/documents.vue`, `business-cabinet/documents.vue`. Шапка H1 + фильтр `v-chip-group` Все/Договор/Агентский. Карточка `.gv-card-elevated pa-5`: заголовок 14px 600; «Бронь #… · Дата» 12px secondary; статус `v-chip` (Подписан success / На подписи warning / Ожидает default); «ОТКРЫТЬ PDF» outlined + «СКАЧАТЬ» primary small (disabled если нет URL). Empty «Документов пока нет».

### Экран 12. Уведомления Telegram (`renter-cabinet/notifications`)

Статус: Подключено `v-chip tonal success` / Не подключено `tonal error`. Карточка событий `.gv-card-elevated pa-6 mb-6`: «Вы будете получать уведомления:» 14px 600 + 5 строк `mdi-bell-outline` 16px + 14px secondary. Кнопки: «ПОДКЛЮЧИТЬ TELEGRAM» primary / «ОТКЛЮЧИТЬ» outlined; UI-заглушка → toast «Функция в разработке».

### Экран 13. Админка Дашборд (`admin/index.vue`, layout admin)

Шапка `gorodaivesi · Админка` Nunito 900 14px + «На сайт»/«Выйти» text right. 3 stat-карточки (`v-col md=4` `.gv-card-elevated pa-4`): метрика 14px 600; delta 12px `#3daff5`; иконки `mdi-eye/account-plus/calendar-check` 20px `#ff6600`. 3 инфо-блока (объявления на модерации / новые пользователи / последние брони): заголовок 14px 600 mb-3 + строки 12px secondary. Таблица верификации орг: `v-card variant=outlined rounded=lg` `v-table`; кнопки Подтвердить(success outlined)/Отклонить(error outlined) small.

### Экран 14. Админка Категории (`admin/categories`)

Шапка H1 + «СОЗДАТЬ КАТЕГОРИЮ» primary. Таблица: заголовки 12px 600 secondary bg `#f5f5f5` pad `12px 16px`; строки 12-13px border-top `#f0f0f0`. Колонки: Название / Иконка(emoji) / Статус(chip Вкл success/Выкл outlined) / Порядок / Действия (ИЗМ outlined / СКР outlined / УДАЛ error outlined small). Модалка `v-dialog 440` radius 18px: поля название/иконка/порядок + Отмена(text)/СОХРАНИТЬ(primary). Mobile: scroll.

### Экран 15. Админка Модерация (`admin/moderation`)

Фильтр `v-chip-group` Все/На модерации/Одобрено/Отклонено/Скрыто. Список (border rounded-lg): заголовки bg `#f5f5f5`; строка Название/Автор/Категория/Статус/Действия (СМОТР primary target=_blank + ОК primary + ОТКЛ outlined + СКР outlined + УДАЛ error outlined, small). Модалка отклонения `v-dialog 440` radius 18px: `v-textarea` «Причина отклонения» rows3 + Отмена(text)/ОТКЛОНИТЬ(error); toast после действия.

### Экран 16. Админка Пользователи (`admin/users`)

Фильтры: роль `v-chip-group` Все/Арендатор/Арендодатель; верификация Все/На проверке/Подтверждён/Отклонён. Таблица `v-table .admin-users-table`: Пользователь(аватар 28px+email/ФИО) / Тип / Роль(chip) / Статус верификации(chip) / Кол-во объявлений / Кол-во броней / Статус аккаунта(chip Активен success/Заблокирован error) / Действия (ПРОФИЛЬ outlined + ЗАБЛОКИР./РАЗБЛОКИР. error/success outlined small). Модалка блокировки `v-dialog 360` radius 18px: предупреждение 14px + Отмена(text)/ЗАБЛОКИРОВАТЬ(error).

---

## 4. УТОЧНЕНИЯ ДЛЯ РАЗРАБОТЧИКА

**4.1 Radius:** Vuetify lg=8px, xl=28px не совпадают. Кнопки/поля — `.gv-cta`/override `!important`; диалоги — `style="border-radius: 18px"`; карточки — `.gv-card-elevated`.
**4.2 Uppercase:** в `vuetify.ts` глобально `text-transform: none` — для `.gv-cta` вернуть `uppercase !important` (при нужде `:deep(.v-btn__content)`).
**4.3 DaData:** на blur поля ИНН → запрос, `v-progress-circular size=16` в поле, успех → read-only блок + «Использовать»; ошибка → `v-alert type=warning tonal` 13px.
**4.4 Toast (`vue3-toastify`):** success 4000ms, error/warning 6000ms, top-right.
**4.5 Loading:** `v-progress-linear indeterminate color=primary mb-4`, не дублировать со спиннером.
**4.6 Шрифты (`nuxt.config`/`app.head`):** preconnect + `Montserrat:wght@400;500;600;700` + `Nunito:wght@900`.

**4.7 Существующие компоненты — не дублировать:** RentalCard, EmptyState, ListingCardSkeleton, AppHeader, CabinetSelectDialog, RentalCalendar, BookingRangeCalendar, BookingWizardForm, BusinessListingNewForm (нужен dropzone), RentalFilterBar, ListingAvailabilityPicker.

**Новые компоненты:** `StatusChip.vue` (props `status`, `type: booking|listing|verification`), `DocumentCard.vue`, `StatCard.vue`, `FileDropzone.vue`, `DadataSuggest.vue`.
