/**
 * Domain / API models.
 * Define shapes for entities and DTOs here.
 */
export interface ExampleEntity {
  id: string;
  name: string;
  createdAt: Date;
}

export interface CreateExampleInput {
  name: string;
}

export interface UpdateExampleInput {
  name?: string;
}
