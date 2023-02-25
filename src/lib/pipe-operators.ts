import { buffer, debounceTime, filter, map, type MonoTypeOperatorFunction } from 'rxjs';

export function filterForDoubleClick<T>(): MonoTypeOperatorFunction<T> {
	return (source) =>
		source.pipe(
			buffer(source.pipe(debounceTime(250))),
			filter((clicks) => clicks.length > 1),
			map(([value]) => value)
		);
}
