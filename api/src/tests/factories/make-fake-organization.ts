import { faker } from "@faker-js/faker";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import type { Replace } from "./replace.ts";
import { db } from "@/infra/db/client.ts";

type OrganizationProps = typeof organizationsTable.$inferInsert;

type Overrides = Partial<
  Replace<
    OrganizationProps,
    {
      name?: string;
      slug?: string;
    }
  >
>;

export async function makeFakeOrganization(ownerId: string, data = {} as Overrides) {
  const name = data.name ?? faker.company.name();
  // O sufixo evita colisão de slug: o faker repete nomes de empresa, e os
  // dados de execuções anteriores continuam no banco.
  const slug =
    data.slug ??
    `${faker.helpers.slugify(name).toLowerCase()}-${faker.string.alphanumeric(6).toLowerCase()}`;

  await db.insert(organizationsTable).values({
    name,
    slug,
    ownerId,
  });

  return {
    organizationSlug: slug,
  };
}
