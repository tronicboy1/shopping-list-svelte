<script lang="ts">
	import { Firebase } from '$lib/firebase';
	import { ListService } from '$lib/list.service';
	import List from './shopping-list.svelte';
	import Spinner from './loading-spinner.svelte';
	import { combineLatest, first, mergeMap, startWith, Subject, switchMap } from 'rxjs';
	import { stopWhileHidden } from '$lib/pipe-operators';

	let showAddList = false;
	let newListName = '';

	const refreshSubject = new Subject<void>();
	const refresh$ = refreshSubject.pipe(startWith(undefined));
	const lists$ = combineLatest([Firebase.uid$, refresh$]).pipe(
		switchMap(([uid]) => ListService.getLists(uid)),
		stopWhileHidden()
	);

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
					refreshSubject.next();
				},
				error: (error) => alert(error)
			});
	};
</script>

{#if $lists$}
	<ul>
		{#each $lists$ as list}
			<List {list} on:refresh={() => refreshSubject.next()} />
		{/each}
	</ul>
	{#if showAddList}
		<div class="card">
			<form
				autocomplete="off"
				on:submit|preventDefault={handleNewList}
				on:blur={() => (showAddList = false)}
			>
				<input
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
{:else}
	<Spinner />
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
