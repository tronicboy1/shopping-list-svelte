<script lang="ts">
	import { goto } from '$app/navigation';
	import { Firebase } from '$lib/firebase';
	import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
	import { first, map } from 'rxjs';

	if (process.env.NODE_ENV === 'development') {
		//@ts-ignore
		self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
	}
	initializeAppCheck(Firebase.app, {
		provider: new ReCaptchaV3Provider('6LcuLlsgAAAAADL_n_1hS7zeQMKX6xbi10jQYIYR'),
		isTokenAutoRefreshEnabled: true
	});

	Firebase.authState$
		.pipe(
			first(),
			map((user) => Boolean(user))
		)
		.subscribe((isLoggedIn) => {
			console.log('logged in?', isLoggedIn);
			if (isLoggedIn) return;
			goto('/auth');
		});
</script>

<slot />

<style>
</style>
