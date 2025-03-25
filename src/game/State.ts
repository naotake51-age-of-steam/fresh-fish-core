import cloneDeep from "lodash.clonedeep";

type Writable<T> = { -readonly [P in keyof T]: T[P] };

export abstract class State {
  public cloneDeep(): this {
    return cloneDeep(this);
  }

  public produce(producer: (draft: Writable<this>) => void): this {
    const draft = this.cloneDeep();

    producer(draft);

    return draft;
  }
}
