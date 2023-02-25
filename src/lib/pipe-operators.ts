import {
	buffer,
	debounceTime,
	filter,
	fromEvent,
	map,
	startWith,
	switchMap,
	type MonoTypeOperatorFunction
} from 'rxjs';

export function filterForDoubleClick<T>(): MonoTypeOperatorFunction<T> {
	return (source) =>
		source.pipe(
			buffer(source.pipe(debounceTime(250))),
			filter((clicks) => clicks.length > 1),
			map(([value]) => value)
		);
}

export function stopWhileHidden<T>(): MonoTypeOperatorFunction<T> {
	const visibilityEvent$ = fromEvent(document, 'visibilitychange').pipe(startWith(undefined));
	return (source) =>
		visibilityEvent$.pipe(
			filter(() => document.visibilityState === 'visible'),
			switchMap(() => source)
		);
}
