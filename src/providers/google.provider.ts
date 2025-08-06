import { google } from 'googleapis';

export function getGoogleAuth(scopes: Array<string>) {
	// Method 3: Try to find credentials.json in current directory
	const credentialsPath = './credentials.json';

	return new google.auth.GoogleAuth({
		keyFile: credentialsPath,
		scopes,
	});
}
