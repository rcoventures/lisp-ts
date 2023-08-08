import {
  IsIdentifier,
  IsIdentifierList,
  IsList,
  type AST,
  type AsyncProcedure,
  type IdentifierList,
} from "#src/language/ast.js";
import { Constructor, type Env } from "#src/language/environment.js";
import { evaluate } from "#src/language/evaluator.js";

export const Identifier = Symbol.for("lambda");

export type Form = [typeof Identifier, IdentifierList, AST];

export const Is = (ast: AST): ast is Form =>
  IsList(ast) &&
  ast.length === 3 &&
  IsIdentifier(ast[0]) &&
  ast[0] === Identifier &&
  IsIdentifierList(ast[1]);

export const Apply =
  (env: Env) =>
  (ast: Form): AsyncProcedure => {
    const argsIdentifiers = ast[1];
    const body = ast[2];
    return (prenv: Env) =>
      (...values: AST[]) => {
        const env = Constructor(prenv.map);
        argsIdentifiers.forEach((identifier, i) =>
          env.map.set(identifier, values[i])
        );
        return evaluate(env)(body);
      };
  };
