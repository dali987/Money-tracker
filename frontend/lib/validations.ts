import z from "zod"

export const transactionSchema = z
  .strictObject({
    type: z.enum(["expense", "income", "transfer"]),
    fromAccount: z.string().optional().nullable(),
    toAccount: z.string().or(z.never()).optional().nullable(), // only for transfer
    amount: z
      .number()
      .positive("Amount must be greater than 0"),
    date: z.string().nullable(),
    note: z.string().optional(),
    tags: z.array(z.string().nullable()).optional().nullable(),
  })
  // .superRefine((data, ctx) => {
  //   // Transfer-specific validation
  //   if (data.type === "transfer") {
  //     if (!data.toAccount) {
  //       ctx.addIssue({
  //         code: "custom",
  //         path: ["to"],
  //         message: "Select a destination for transfer",
  //       });
  //     } else if (data.from === data.toAccount) {
  //       ctx.addIssue({
  //         code: "custom",
  //         path: ["to"],
  //         message: "Source and destination cannot be the same",
  //       });
  //     }
  //   }
  // });

