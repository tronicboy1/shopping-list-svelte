import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';

export class SvelteSubject<T> extends Subject<T> {
	set(value: T) {
		this.next(value);
	}
}

export class SvelteBehaviorSubject<T> extends BehaviorSubject<T> {
	set(value: T) {
		this.next(value);
	}
}

export class SvelteReplaySubject<T> extends ReplaySubject<T> {
	set(value: T) {
		this.next(value);
	}
}
