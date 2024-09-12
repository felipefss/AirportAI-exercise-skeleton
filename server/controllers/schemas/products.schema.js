const { z } = require('zod');

const productSchema = z.object({
  type: z.string(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  description: z.string().refine((value) => value.length > 0, {
    message: 'Description must be provided',
  }),
});

function parseProductSchema(payload) {
  return productSchema.safeParse(payload);
}

const reportLostSchema = z
  .object({
    message: z.string(),
    keywords: z.string().transform((value) => {
      const keywords = value.split(',');

      // Remove any whitespace from the keywords.
      return keywords.map((keyword) => keyword.trim());
    }),
    lostTime: z.string().datetime(),
    email: z.string().email(),
  })
  .partial({
    keywords: true,
    message: true,
  })
  .refine((data) => data.message || data.keywords, {
    message: 'Either message or keywords must be provided',
  });

function parseReportLostSchema(payload) {
  return reportLostSchema.safeParse(payload);
}

module.exports = {
  productSchema: parseProductSchema,
  reportLostSchema: parseReportLostSchema,
};
