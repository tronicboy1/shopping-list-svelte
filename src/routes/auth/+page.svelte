<script lang="ts">
	import { goto } from '$app/navigation';
	import { Firebase } from '$lib/firebase';
	import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
	let error = '';
	let mode: 'LOGIN' | 'REGISTER' = 'LOGIN';
	let username = '';
	let password = '';
	let loading = false;

	const handleSubmit: EventListener = () => {
		if (!(username && password)) return;
		switch (mode) {
			case 'LOGIN':
				signInWithEmailAndPassword(Firebase.auth, username, password)
					.then(() => goto('/'))
					.catch((authError) => {
						error = authError.message;
					});
				break;
			case 'REGISTER':
				createUserWithEmailAndPassword(Firebase.auth, username, password)
					.then(() => goto('/'))
					.catch((authError) => {
						error = authError.message;
					});
				break;
			default:
				break;
		}
	};
</script>

<div class="card">
	<h1>Listo</h1>
	<h3>An elegant List Manager</h3>
	<div class="button-group">
		<button
			on:click={() => (mode = 'LOGIN')}
			class:active={mode !== 'LOGIN'}
			class="button-left"
			id="login-button"
			type="button"
		>
			Login
		</button>
		<button
			on:click={() => (mode = 'REGISTER')}
			class:active={mode !== 'REGISTER'}
			class="button-right"
			id="register-button"
			type="button"
		>
			Register
		</button>
	</div>
	{#if error}
		<p id="errors">{error}</p>
	{/if}
	<form on:submit|preventDefault={handleSubmit} class="login-form">
		{#if mode === 'LOGIN'}
			<div class="form-group">
				<label for="email">Email</label>
				<input
					bind:value={username}
					id="email"
					name="email"
					type="email"
					required
					autocomplete="email"
				/>
			</div>
			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					bind:value={password}
					required
					autocomplete="current-password"
				/>
			</div>
		{:else}
			<div class="form-group">
				<label for="email">Email</label>
				<input
					bind:value={username}
					id="email"
					name="email"
					type="email"
					required
					autocomplete="email"
				/>
			</div>
			<div class="form-group">
				<label for="password">Password</label>
				<input
					bind:value={password}
					id="password"
					name="password"
					type="password"
					required
					autocomplete="new-password"
				/>
			</div>
			<div class="form-group">
				<label for="password-confirm">Confirm Password</label>
				<input
					id="password-confirm"
					name="password-confirm"
					type="password"
					required
					autocomplete="new-password"
				/>
			</div>
		{/if}
		<button id="submit" type="submit">
			{#if loading}<loading-spinner color="white" />{:else}Submit{/if}
		</button>
	</form>
</div>

<style>
	:host {
		animation: fadeIn 0.5s forwards;
		opacity: 0;
	}

	h1 {
		text-align: center;
		font-size: 4rem;
		margin: 1rem 0 0 0;
	}

	h3 {
		text-align: center;
		margin-bottom: 2rem;
	}
	.form-group {
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
	}

	.form-group input {
		height: 40px;
		padding-left: 0.5rem;
		border: 1px solid var(--secondary-color);
		border-radius: 4px;
		font-size: large;
	}

	.form-group label {
		margin-bottom: 0.25rem;
	}

	.button-group {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	button {
		border: 1px solid var(--highlight-color);
		padding: 0.25rem 0.5rem;
		font-size: 1.1rem;
		height: 50px;
		color: white;
		background-color: var(--highlight-color);
		border-radius: 4px;
		flex: 0 1 45%;
		cursor: pointer;
		margin: 0;
	}

	.active {
		background-color: var(--secondary-color);
		border-color: var(--secondary-color);
	}
	.active:hover {
		background-color: var(--secondary-color);
		border-color: var(--secondary-color);
	}
	button:hover {
		background-color: var(--highlight-hover);
		border-color: var(--highlight-hover);
	}
	.button-left {
		border-radius: 4px 0 0 4px;
		flex: 1 0;
	}
	.button-right {
		border-radius: 0 4px 4px 0;
		flex: 1 0;
	}

	form {
		display: flex;
		flex-direction: column;
	}

	form button {
		padding: 0.5rem 0.75rem;
		height: 50px;
		max-height: 50px;
		flex: auto;
	}

	form:invalid button {
		background-color: var(--secondary-color);
		border-color: var(--secondary-color);
		cursor: not-allowed;
	}

	#errors {
		--error-color: orange;
		--error-secondary: rgb(255, 225, 170);
		background-color: var(--danger-color);
		padding: 1rem;
		border: 1px solid var(--danger-color);
		border-radius: 4px;
		display: block;
	}

	@media (prefers-color-scheme: dark) {
		* {
			color: white;
		}
	}
</style>
