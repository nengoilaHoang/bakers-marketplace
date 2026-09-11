export class Recipe {
  id?: string;

  cover_img_id?: string | null;
  user_id?: string | null;

  title?: string;
  description?: string | null;
  portion?: number | null;

  is_public?: boolean;
  is_snapshot?: boolean;

  created_at?: Date;
  updated_at?: Date;

  constructor(data?: Partial<Recipe>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}