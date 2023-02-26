<script lang="ts">
	import { Firebase } from '$lib/firebase';
	import { ListService, type Lists } from '$lib/list.service';
	import { filterForDoubleClick } from '$lib/pipe-operators';
	import { distinctUntilChanged, first, map, mergeMap, share, Subject, switchMap, takeUntil, withLatestFrom } from 'rxjs';
	import { onDestroy, createEventDispatcher } from 'svelte';

	export let list: Lists[0];
	const teardown$ = new Subject<void>();
	onDestroy(() => teardown$.next());
	const dispatcher = createEventDispatcher();

	const tileClick$ = new Subject<string>();
	const tileDoubleClick$ = tileClick$.pipe(filterForDoubleClick(), share());
	tileDoubleClick$
		.pipe(
			takeUntil(teardown$),
			distinctUntilChanged(),
			withLatestFrom(Firebase.uid$),
			mergeMap(([itemId, uid]) => ListService.deleteItem(uid, list.key, itemId))
		)
		.subscribe();
	const deleteClick$ = new Subject<void>();
	const deleteDoubleClick$ = deleteClick$.pipe(filterForDoubleClick(), share());
	deleteDoubleClick$
		.pipe(
			takeUntil(teardown$),
			switchMap(() => Firebase.uid$),
			switchMap((uid) => ListService.deleteList(uid, list.key))
		)
		.subscribe(() => dispatcher('refresh'));
	const deleting$ = deleteDoubleClick$.pipe(map(() => true));

	let todoInput = '';
	let addingNewItem = false;
	const handleListAdd = () => {
		const todo = todoInput.trim();
		if (!todo || addingNewItem) return;
		addingNewItem = true;
		Firebase.uid$
			.pipe(
				first(),
				mergeMap((uid) => ListService.addItem(uid, list.key, { item: todo }))
			)
			.subscribe({
				next: () => {
					todoInput = '';
				},
				complete: () => {
					addingNewItem = false;
				}
			});
	};
</script>

<li class="card">
	<div class="title">
		<h2>{list.listName}</h2>
		<span>{list.data.length ?? 0}</span>
	</div>
	<div id="contents">
		<form on:submit|preventDefault={handleListAdd} autocomplete="off">
			<input
				bind:value={todoInput}
				id="item"
				name="item"
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
		<ul>
			{#if list.data.length}
				{#each list.data as item}
					<li
						id={item.key}
						draggable="true"
						class:priority={item.priority}
						class="item"
						on:click={() => tileClick$.next(item.key)}
						on:keydown={() => {}}
						class:deleting={$tileDoubleClick$ === item.key}
					>
						<span>{item.item}</span>
						{#if item.amount && item.amount > 1} <small>x{item.amount}</small>{/if}
					</li>
				{/each}
			{:else}
				<button
					type="button"
					class="delete"
					on:click={() => deleteClick$.next()}
					class:deleting={$deleting$}>Delete List</button
				>
			{/if}
		</ul>
	</div>
</li>

<style>
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

	#clear {
		height: 54px;
		border-radius: 8px;
	}

	svg {
		width: auto;
		height: 100%;
		fill: white;
	}

	.title {
		display: inline-block;
		position: sticky;
		top: 0;
		padding: 1rem 0 1rem 0;
		margin: 0;
		background-color: var(--primary-color);
	}

	.deleting {
		color: grey !important;
		background-color: lightgray !important;
		border-color: lightgray !important;
	}

	.card {
		padding-top: 0;
		position: relative;
	}
	:host([hide-list]) .card {
		padding: 0 1rem 0 1rem;
	}

	.title + #contents {
		margin-top: 1rem;
	}

	.title {
		width: 100%;
		display: block;
		position: relative;
		border-bottom: 1px solid var(--secondary-color);
		user-select: none;
		cursor: pointer;
		z-index: 2;
	}

	.title h2 {
		text-align: center;
		margin: 0;
	}

	.title span {
		display: inline-flex;
		opacity: 0;
		position: absolute;
		right: 0;
		bottom: 0;
		top: 0;
		margin: auto 0;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background-color: var(--secondary-color);
		padding: 0 0.35rem;
		border-radius: 60%;
		transition: opacity 0.3s;
	}
	:host([hide-list]) .title {
		border: none;
		margin: 0;
	}
	:host([hide-list]) .title span {
		opacity: 1;
	}

	:host([hide-list]) #contents {
		display: none;
	}

	.item {
		display: flex;
		flex-direction: row;
		justify-content: center;
		position: relative;
		align-items: center;
		border: 1px var(--secondary-color) solid;
		background: var(--secondary-color);
		border-radius: 8px;
		color: black;
		padding: 1.25rem 0.5rem;
		transition: all 0.2s;
		margin-bottom: 0.5rem;
		text-align: center;
		font-size: 1.8rem;
		user-select: none;
		-webkit-user-select: none;
	}

	.item span {
		word-wrap: break-word;
	}

	.item div + span {
		width: 60%;
		margin: 0 auto;
	}

	.item[priority] {
		background-color: var(--danger-color);
		border-color: var(--danger-color);
	}

	.item small {
		font-size: 1rem;
		margin-left: 0.5rem;
	}

	#has-image {
		display: inline-flex;
		position: absolute;
		left: 8px;
		bottom: 0;
		top: 0;
		margin: auto 0;
		align-items: center;
		justify-content: center;
		background-color: var(--highlight-color);
		height: 43px;
		width: 43px;
		border-radius: 4px;
		transition: opacity 0.3s;
	}

	.item:hover {
		cursor: pointer;
	}

	.item:first-child {
		margin-bottom: 0;
	}

	@media (prefers-color-scheme: dark) {
		.item {
			color: white;
		}
	}
</style>
