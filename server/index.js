const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

/* ============================================================
 * MIDDLEWARE (глобальные)
 * ============================================================ */

// 1. CORS — чтобы frontend мог обращаться к API
app.use(cors());

// 2. Парсинг JSON и urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Логирование всех входящих запросов (задача Алексеева)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

/* ============================================================
 * РАЗДАЧА СТАТИКИ (задача Алексеева)
 * ============================================================ */
const CLIENT_DIR = path.join(__dirname, '..', 'client');
app.use(express.static(CLIENT_DIR));

/* ============================================================
 * API-РОУТЫ
 * ============================================================ */

// --- Курсы (Агизов И.Д.) ---
const coursesRouter = require('./routes/courses');
app.use('/api/courses', coursesRouter);

// --- Записи (Выдрина В.И.) ---
// Раскомментировать, когда будет готов routes/bookings.js:
// const bookingsRouter = require('./routes/bookings');
// app.use('/api/bookings', bookingsRouter);

// --- Отзывы (Грищенко Р.А.) ---
// Раскомментировать, когда будет готов routes/reviews.js:
// const reviewsRouter = require('./routes/reviews');
// app.use('/api/reviews', reviewsRouter);

/* ============================================================
 * СЛУЖЕБНЫЕ ЭНДПОИНТЫ
 * ============================================================ */

// Проверка работоспособности сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ============================================================
 * ОБРАБОТКА 404 (задача Алексеева + Золотухина)
 * ============================================================ */

// Для API — JSON-ошибка
app.use('/api', (req, res) => {
  res.status(404).json({
    error: true,
    message: `Эндпоинт ${req.method} ${req.originalUrl} не найден`,
    field: null
  });
});

// Для страниц — кастомная 404.html (если существует)
app.use((req, res) => {
  const notFoundPage = path.join(CLIENT_DIR, '404.html');
  if (fs.existsSync(notFoundPage)) {
    return res.status(404).sendFile(notFoundPage);
  }
  res.status(404).send('<h1>404 — Страница не найдена</h1>');
});

/* ============================================================
 * ОБРАБОТКА 500 (задача Золотухина)
 * ============================================================ */
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({
    error: true,
    message: 'Внутренняя ошибка сервера',
    field: null
  });
});

/* ============================================================
 * ЗАПУСК
 * ============================================================ */
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
  console.log(`   API курсов:    http://localhost:${PORT}/api/courses`);
  console.log(`   Health-check:  http://localhost:${PORT}/api/health`);
});
