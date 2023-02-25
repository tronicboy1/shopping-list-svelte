<script lang="ts">
	import { Firebase } from '$lib/firebase';
	import { ListService } from '$lib/list.service';
	import List from './shopping-list.svelte';
	import Spinner from './loading-spinner.svelte';
	import { first, mergeMap, switchMap } from 'rxjs';

	let showAddList = false;
	let newListName = '';
	const lists$ = Firebase.uid$.pipe(switchMap((uid) => ListService.getLists(uid)));

	const handleNewList = () => {
		if (newListName.length > 32) return;
		Firebase.uid$
			.pipe(
				first(),
				mergeMap((uid) => ListService.addList(uid, newListName))
			)
			.subscribe({
				next: () => {
					newListName = '';
					showAddList = false;
				},
				error: (error) => alert(error)
			});
	};
</script>

{#if $lists$}
	<ul>
		{#each $lists$ as list}
			<List {list} />
		{/each}
	</ul>
{:else}
	<Spinner />
{/if}

{#if showAddList}
	<div class="card">
		<form autocomplete="off" on:submit|preventDefault={handleNewList}>
			<input
				on:blur={() => (showAddList = false)}
				bind:value={newListName}
				id="list-name"
				name="list-name"
				minlength="1"
				type="text"
				maxlength="33"
				required
			/>
			<button id="add" type="submit">
				<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0, 0, 48, 48">
					<path d="M22.5 38V25.5H10V22.5H22.5V10H25.5V22.5H38V25.5H25.5V38Z" />
				</svg>
			</button>
		</form>
	</div>
{:else}
	<div id="open-add-list" on:click={() => (showAddList = true)} on:keypress={() => {}}>
		<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0, 0, 48, 48">
			<path d="M22.5 38V25.5H10V22.5H22.5V10H25.5V22.5H38V25.5H25.5V38Z" />
		</svg>
	</div>
{/if}

<style>
	#open-add-list {
		display: flex;
		width: 50px;
		height: 50px;
		margin: 1rem auto;
		background-color: var(--secondary-color);
		border: 1px solid var(--secondary-color);
		border-radius: 50%;
		cursor: pointer;
	}

	form {
		display: flex;
		flex-direction: row;
	}

	form input {
		height: 50px;
		border: 1px solid var(--secondary-color);
		border-right: none;
		border-radius: 4px 0 0 4px;
		flex: 1 1;
		font-size: 1.2rem;
		padding-left: 0.25rem;
		outline: none;
		margin: 0;
		min-width: 50px;
	}

	form button {
		border-radius: 0 4px 4px 0;
		border-left: none;
		flex: 0 0 20%;
		height: 50px;
	}

	form:invalid button {
		background-color: var(--secondary-color);
		border-color: var(--secondary-color);
	}

	button {
		border: 1px solid var(--highlight-color);
		background-color: var(--highlight-color);
		border-radius: 4px;
		color: white;
		height: 40px;
		font-size: 1.2rem;
		cursor: pointer;
		margin: 0;
		transition: all 0.3s;
	}

	svg {
		width: auto;
		height: 100%;
		fill: white;
	}
</style>
