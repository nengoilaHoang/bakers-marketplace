const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_OAUTH_CALLBACK_PATHS = {
	login: '/authen/google/callback',
	register: '/authen/google/callbackRegister',
} as const;

export type GoogleOAuthFlow = keyof typeof GOOGLE_OAUTH_CALLBACK_PATHS;

function getGoogleOAuthStateKey(flow: GoogleOAuthFlow): string {
	return `google-oauth-state:${flow}`;
}

export function getGoogleOAuthRedirectUri(flow: GoogleOAuthFlow): string {
	return new URL(
		GOOGLE_OAUTH_CALLBACK_PATHS[flow],
		window.location.origin,
	).toString();
}

export function startGoogleOAuth(flow: GoogleOAuthFlow): void {
	const clientId = process.env.GOOGLE_CLIENT_ID?.trim();

	if (!clientId) {
		throw new Error('Google OAuth chưa được cấu hình.');
	}

	const state = crypto.randomUUID();
	const authorizationUrl = new URL(GOOGLE_AUTHORIZATION_URL);

	sessionStorage.setItem(getGoogleOAuthStateKey(flow), state);
	authorizationUrl.searchParams.set('client_id', clientId);
	authorizationUrl.searchParams.set('redirect_uri', getGoogleOAuthRedirectUri(flow));
	authorizationUrl.searchParams.set('response_type', 'code');
	authorizationUrl.searchParams.set('scope', 'openid email profile');
	authorizationUrl.searchParams.set('state', state);
	authorizationUrl.searchParams.set('include_granted_scopes', 'true');
	authorizationUrl.searchParams.set('prompt', 'select_account');

	window.location.assign(authorizationUrl.toString());
}

export function consumeGoogleOAuthState(
	receivedState: string,
	flow: GoogleOAuthFlow,
): boolean {
	const stateKey = getGoogleOAuthStateKey(flow);
	const expectedState = sessionStorage.getItem(stateKey);

	sessionStorage.removeItem(stateKey);

	return Boolean(expectedState) && receivedState === expectedState;
}
