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
			buffer(source.pipe(debounceTime(200))),
			filter((clicks) => clicks.length > 1),
			map(([value]) => value)
		);
}
/**
 * Page Visibility APIでObservableを一時的に中断するPipe Operator
 */
export function stopWhileHidden<T>(): MonoTypeOperatorFunction<T> {
        const visibilityEvent$ = fromEvent(document, 'visibilitychange').pipe(startWith(undefined));
        return (source) =>
            visibilityEvent$.pipe(
                map(() => document.visibilityState === 'visible'),
                switchMap((isVisible) => (isVisible ? source : of<T>()))
            );
    }
}
