import type { Recipe } from "@/types/recipe";

import RecipeCard from "./RecipeCard";

type RecipeGridProps = {
  recipes: Recipe[];
  getRecipeHref?: (recipe: Recipe) => string;
};

export default function RecipeGrid({ recipes, getRecipeHref }: RecipeGridProps) {
  return (
    <section aria-label="Danh sách công thức">
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {recipes.map((recipe, index) => (
          <li key={recipe.id ?? `${recipe.title}-${index}`}>
            <RecipeCard recipe={recipe} href={getRecipeHref?.(recipe)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
