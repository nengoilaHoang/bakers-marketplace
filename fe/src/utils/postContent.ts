// Bài viết gắn công thức bằng token [[recipe:<id>]] trong content (BE tự thêm khi tạo bài kèm công thức).
// Công thức đã được BE trả về sẵn ở post.recipe, nên khi hiển thị/sửa nội dung thì bỏ token đi.
const RECIPE_TOKEN_REGEX =
  /\s*\[\[recipe:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\]\]/g;

export function stripRecipeToken(content: string): string {
  return content.replace(RECIPE_TOKEN_REGEX, '').trim();
}
