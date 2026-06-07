---
name: form-pattern
description: Enforces strict form architecture using React Hook Form + Zod + project design system.
---

# Form Pattern Skill

This skill enforces a STRICT form implementation pattern.

It must always be applied whenever a form is created.

---

# Mandatory Stack

All forms MUST use:

- React Hook Form
- Zod
- @hookform/resolvers/zod
- Project Design System Input component

Never use:
- Formik
- Yup
- Inline validation
- Custom manual validation
- useState for form control

---

# Required useForm Pattern (STRICT)

Every form MUST follow this exact pattern:

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting }
} = useForm<FormType>({
  resolver: zodResolver(formSchema)
});
```

---

## 1. Zod Schema

Schemas live in `src/schemas/<domain>/<name>.schema.ts`. The form type is inferred directly from the schema using `z.infer`.

```ts
// src/schemas/record/create-record.schema.ts
import { z } from "zod";

export const createRecordSchema = z.object({
  name: z.string(),
});

export type CreateRecordFormType = z.infer<typeof createRecordSchema>;
```

---

## 2. useForm with zodResolver

`useForm` is typed with the inferred schema type. The resolver connects Zod to react-hook-form's validation.

```ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type CreateRecordFormType,
  createRecordSchema,
} from "@/schemas/record/create-record.schema";

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  watch,
} = useForm<CreateRecordFormType>({
  resolver: zodResolver(createRecordSchema),
});
```

### What to extract from `useForm`:
| Property | Usage |
|---|---|
| `register` | Registers the input into the form |
| `handleSubmit` | Wraps `onSubmit`, runs validation first |
| `errors` | Validation errors per field |
| `isSubmitting` | `true` while `onSubmit` is running |
| `watch` | Reactively observes a field value |

---

## 3. Registering inputs

Spread `register("field")` onto the input component. It injects `name`, `ref`, `onChange` and `onBlur`.

```tsx
<Input placeholder="Rcc Engineering" {...register("name")} />
```

For **read-only** inputs derived from another field, do not register them — just pass the value as `placeholder` or `value`:

```tsx
// slug is derived from watch("name"), it is not a form field
const slug = createSlug(watch("name"));
<Input readOnly placeholder={slug} />
```

---

## 4. Displaying validation errors

```tsx

import {
  FieldError,
} from "@/components/ui/field";

{errors.name && <FieldError>{errors.name.message}</FieldError>}
```

---

## 5. Submitting the form

`handleSubmit` ensures `onSubmit` is only called if validation passes. The handler receives the already-typed `formBody`.

```ts
async function handleSubmitRecord(formBody: CreateOrganizationFormType) {
  const { name } = formBody;
  // submission logic...
}
```


```tsx
<form onSubmit={handleSubmit(handleSubmitRecord)}>
```

---

## 6. Disabling the button during submission

```tsx
<Button type="submit" disabled={isSubmitting}>
  Create Record
</Button>
```
