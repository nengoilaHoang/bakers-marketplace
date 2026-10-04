/**
 * A post links to its recipe through a token inside its content, e.g.
 * "Mousse dâu cho cuối tuần [[recipe:2222…]]". There is no foreign key, so the
 * token is the only link. A post has at most one token, pointing to a snapshot.
 *
 * Only lowercase UUIDs are matched so every match can be cast to uuid in SQL.
 */
const UUID_PATTERN =
	'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

/** POSIX pattern for Postgres: substring(content from …) returns the recipe id. */
export const RECIPE_TOKEN_SQL_PATTERN = `\\[\\[recipe:(${UUID_PATTERN})\\]\\]`;

const RECIPE_TOKEN_REGEX = new RegExp(`\\[\\[recipe:(${UUID_PATTERN})\\]\\]`, 'g');

function buildRecipeToken(recipeId: string): string {
	return `[[recipe:${recipeId.toLowerCase()}]]`;
}

export function extractRecipeIds(content: string): string[] {
	return [...content.matchAll(RECIPE_TOKEN_REGEX)].map((match) => match[1]);
}

/** The recipe token goes on its own paragraph at the end of the content. */
export function appendRecipeToken(content: string, recipeId: string): string {
	return `${content.trimEnd()}\n\n${buildRecipeToken(recipeId)}`;
}
