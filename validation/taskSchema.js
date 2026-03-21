// gelen verinin doğruluğunu kontrol etmek için kullanılır
const { z } = require("zod");

const createTaskSchema = z.object({
  title: z.string().min(3, "Title en az 3 karakter olmalı").max(100),
});

module.exports = { createTaskSchema };