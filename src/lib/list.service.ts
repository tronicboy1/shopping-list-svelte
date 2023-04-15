import {
	child,
	get,
	push,
	ref,
	remove,
	set,
	onChildAdded,
	onChildRemoved,
	query,
	orderByKey
} from 'firebase/database';
import { ref as getStorageRef, deleteObject } from 'firebase/storage';
import {
	combineLatest,
	from,
	map,
	merge,
	mergeMap,
	Observable,
	of,
	scan,
	switchMap,
	type MonoTypeOperatorFunction
} from 'rxjs';
import { Firebase } from './firebase';

export type ShoppingListData = Record<string, ShoppingListItem>;

export interface ShoppingListItem {
	item: string;
	memo: string;
	dateAdded: number;
	amount: number;
	imagePath: string;
	priority: boolean;
	order: number;
}
interface ShoppingListItemWithKey extends ShoppingListItem {
	key: string;
}

export type ListGroups = Record<
	string,
	{ data: Record<string, ShoppingListItem>; listName: string }
>;

export type Lists = {
	data: ShoppingListItemWithKey[];
	listName: string;
	key: string;
}[];

export class ListService {
	/**
	 * Gets all lists and their data.
	 * HOT Observable for list items.
	 */
	public static getLists(uid: string): Observable<Lists> {
		const q = query(ref(Firebase.db, `${uid}/SHOPPING-LISTS/`), orderByKey());
		return from(get(q)).pipe(
			map((result) => (result.val() ?? {}) as ListGroups),
			map((lists) => Object.entries(lists)),
			map((lists) => lists.map(([key, value]) => ({ key, ...value }))),
			map(lists => lists.reverse()),
			map((lists) =>
				lists.map((list) => ({
					...list,
					data: list.data
						? Object.entries(list.data!).map(([key, data]) => ({
								key,
								...data
						  }))
						: []
				}))
			),
			this.watchForChangesOnLists(uid)
		);
	}

	private static watchForChangesOnLists(uid: string): MonoTypeOperatorFunction<Lists> {
		return (source) =>
			source.pipe(
				switchMap((lists) =>
					combineLatest(
						lists.map((list) =>
							merge(
								of(list.data),
								this.watchListAdditions$(uid, list.key),
								this.watchListRemovals$(uid, list.key)
							).pipe(
								scan((acc, value) => {
									/** deletions */
									if (typeof value === 'string') {
										acc.delete(value);
										return acc;
									}
									/** new additions */
									if (!Array.isArray(value)) {
										if (acc.has(value.key)) return acc;
										return acc.set(value.key, value);
									}
									/** Initial values */
									value.forEach((item) => acc.set(item.key, item));
									return acc;
								}, new Map<string, ShoppingListItemWithKey>()),
								map((itemsMap) => ({ ...list, data: Array.from(itemsMap.values()) }))
							)
						)
					)
				)
			);
	}

	private static watchListAdditions$(uid: string, listId: string) {
		return new Observable<ShoppingListItemWithKey>((observer) =>
			onChildAdded(this.getDatabaseRef(uid, listId), (child) => {
				observer.next({ ...child.val(), key: child.key });
			})
		);
	}

	private static watchListRemovals$(uid: string, listId: string) {
		return new Observable<string>((observer) =>
			onChildRemoved(this.getDatabaseRef(uid, listId), (child) => {
				if (!child.key) return;
				observer.next(child.key);
			})
		);
	}

	public static deleteList(uid: string, listId: string) {
		return remove(this.getDatabaseRef(uid, listId, false));
	}

	public static deleteItem(uid: string, listId: string, itemId: string) {
		return from(this.getListItem(uid, listId, itemId)).pipe(
			map((result) => {
				if (!result.exists()) throw TypeError('Cannot delete item that does not exist.');
				return result.val() as ShoppingListItem;
			}),
			mergeMap((data) => {
				const storagePromise = data.imagePath
					? deleteObject(getStorageRef(Firebase.storage, data.imagePath))
					: Promise.resolve();
				return Promise.all([
					remove(child(this.getDatabaseRef(uid, listId), itemId)),
					storagePromise
				]);
			})
		);
	}

	public static addList(uid: string, listName: string) {
		return push(ref(Firebase.db, `${uid}/SHOPPING-LISTS/`), { listName, data: {} });
	}

	public static addItem(uid: string, listId: string, newData: Partial<ShoppingListItem>) {
		const factory: ShoppingListItem = {
			item: '',
			memo: '',
			dateAdded: Date.now(),
			amount: 1,
			imagePath: '',
			priority: false,
			order: 0
		};
		return push(this.getDatabaseRef(uid, listId), { ...factory, ...newData });
	}

	public static updateList(uid: string, listId: string, newData: ShoppingListData) {
		return set(this.getDatabaseRef(uid, listId), newData);
	}

	private static getDatabaseRef(uid: string, listId: string, data = true) {
		return ref(Firebase.db, `${uid}/SHOPPING-LISTS/${listId}/${data ? 'data' : ''}`);
	}

	private static getListItem(uid: string, listId: string, itemId: string) {
		return get(child(this.getDatabaseRef(uid, listId), itemId));
	}
}
