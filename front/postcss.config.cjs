// postcss.config.cjs
module.exports = {
    plugins: {
      '@tailwindcss/postcss': {},   // ← v4 必须用这个
      autoprefixer: {},
    },
  }
  