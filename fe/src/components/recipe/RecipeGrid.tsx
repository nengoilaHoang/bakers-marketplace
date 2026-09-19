import type { Recipe } from "@/types/recipe";

import RecipeCard from "./RecipeCard";

type RecipeGridProps = {
  recipes: Recipe[];
};

export default function RecipeGrid({ recipes }: RecipeGridProps) {
  return (
    <section aria-label="Danh sách công thức">
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {recipes.map((recipe, index) => (
          <li key={recipe.id ?? `${recipe.title}-${index}`}>
            <RecipeCard recipe={recipe} />
          </li>
        ))}
      </ul>
    </section>
  );
}
