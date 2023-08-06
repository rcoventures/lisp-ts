import * as apply from "#src/forms/apply.js";
import { type AST } from "#src/language/ast.js";
import { type Env } from "#src/language/environment.js";
import { parse, write } from "#src/language/parser.js";
import { requestCode } from "../scraper/gpt.js";

export type Form = [typeof Identifier, AST];

export const Identifier = Symbol.for("gpt");

export const Is = (ast: AST): ast is Form =>
  apply.Is(ast) && ast[0] === Identifier;

export const Apply = (env: Env) => async (ast: Form) => {
  const result = await requestPal(write(ast[1]));
  // console.log(result);
  const code = result.code ? parse(result.code) : undefined;
  return code;
};

export const requestPal = async (prompt: string) => {
  const systemPrompt = `
    return only a single correct s-expression in custom programming language, pal.
    it is a basic untyped lambda calculus lisp variant.
    Here is the basic grammar: 

    <program> ::= <exp> | <program> <exp>
    <exp> ::= <symbol> | <boolean> | <number> | <special> | <list> | <string>
    <symbol> ::= { a-z | A-Z } <symbol> | ""
    <boolean> ::= "true" | "false"
    <number> ::= "#" { digit } <number> | ""
    <special> ::= "null" | "undefined"
    <list> ::= "(" <program> ")"
    <string> ::= '"' { any character except '"' or '\' or '(', ')' unless a '\' preceeds it } '"'

    The following special forms are defined:
      (,rator ,rand) - application
      (lambda (,x) ,x) - lambda
      (eval ,x) - evaluates the expression
      (gpt ,x) - passes input back into GPT
      (gui ,x) - opens the expression in the web gui
      (define i ,x) - assigns a expression to a symbol 
      
    Here is the evaluator (its written in typescript):

    export const evaluate = async (ast: AST, env: Env): Promise<AST> => {
      if (IsString(ast)) return ast;
      if (IsProcedure(ast)) return ast;
      if (IsUndefined(ast)) return ast;
      if (IsNull(ast)) return ast;
      if (IsBoolean(ast)) return ast;
      if (IsNumber(ast)) return ast;
      if (envF.Is(ast)) return envF.Apply(env)(ast);
      if (IsIdentifier(ast)) return evaluate(env.map.get(ast), env);
      if (procedure.Is(ast)) procedure.Apply(env)(ast);
      if (gui.Is(ast)) return gui.Apply(env)(ast);
      if (gpt.Is(ast)) return gpt.Apply(env)(ast);
      if (evalF.Is(ast)) return evalF.Apply(env)(ast);
      if (apply.Is(ast)) return apply.Apply(env)(ast);
      if (lambda.Is(ast)) return lambda.Apply(env)(ast);
      if (define.Is(ast)) return define.Apply(env)(ast);
      if (IsList(ast)) return Promise.all(ast.map((ast) => evaluate(ast, env)));
      return undefined;
    };
        `;
  return requestCode([], systemPrompt)(prompt);
};
