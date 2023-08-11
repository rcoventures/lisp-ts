import type { Lang } from "./language/ast.js";
import { TypeSystem } from "./language/typesystem.js";

export type IObserver<V> = (v: V) => undefined;
export type IUnsubscribe = () => undefined;

export interface IEnv {
  ts: TypeSystem;
  map: Map<Lang.ID, Lang.AST>;

  set: (id: Lang.ID, value: Lang.AST) => true;
  get: (id: Lang.ID) => Lang.AST;
  has: (id: Lang.ID) => boolean;

  getAll: () => [Lang.ID, Lang.AST][];
  subscribe: <V extends Lang.AST>(
    id: Lang.ID,
    observer: IObserver<V>
  ) => IUnsubscribe;
  unsubscribe: (id: Lang.ID, observer: IObserver<Lang.AST>) => undefined;
  extend: () => IEnv;
}
