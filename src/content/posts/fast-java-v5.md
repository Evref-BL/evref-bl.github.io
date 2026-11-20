---
title: "FAST-Java v5: a model of what Java writes"
description: FAST-Java v5.0.0 is out. Its model holds what Java writes and nothing else, and reads the same text the same way wherever it stands. Here is what changes and how to move to it.
date: 2026-11-20
kind: news
tags: [fast, java, moose]
authors: [gabriel-darbord]
---

[FAST-Java v5.0.0](https://github.com/moosetechnology/FAST-JAVA/releases/tag/v5.0.0) is out. It is the first release of a new major version of the Moose metamodel of Java syntax trees, and it breaks code written for v4. [MIGRATION.md](https://github.com/moosetechnology/FAST-JAVA/blob/v5.0.0/MIGRATION.md) says what to write instead.

## Why a major version

[Checking FAST-Java against the Java Language Specification](/posts/fast-java-jls-compliance/) found more than missing constructs. The model could also hold programs that no Java compiler accepts, and it described the same text in different ways depending on where it stood. Fixes that kept every reader working went into v4 releases. The others change what a reader finds in the model, so they make a major version.

## The model holds what Java writes, and nothing else

A model that can hold what Java cannot write is no help to an analysis, and lets a transformation build code that does not compile. v5 removes those possibilities wherever the JLS rules them out.

**Annotations are not modifiers.** For `@Deprecated public final void m()`:

| | v4 | v5 |
|---|---|---|
| `modifiers` | `@Deprecated`, `public`, `final` | `public`, `final` |
| `annotations` | — | `@Deprecated` |

Both keep their positions, so the export still writes them in the order of the source. Code that picked the annotations out of the modifiers now reads them directly:

```st
"v4"
aMethod modifiers select: [ :each | each isAnnotation ].
"v5"
aMethod annotations.
```

The other changes of this kind:

- **An array creation is not a class instance creation.** `new int[3]` no longer inherits arguments, a receiver or type arguments, which JLS 15.10.1 never writes.
- **A type is not a variable.** In v4, a type could be assigned to, used as a try resource or written as an annotation element. Now it can only be what Java lets it be: a type, or the receiver of a method reference such as `String::length`.
- **Relations are typed as narrowly as the grammar allows.** Ten relations hold class types rather than any type, such as a superclass, the interfaces a class implements, or the types a `catch` catches. We first checked over 6,013 JDK files that none of them ever held anything else.
- **An element-value pair is not an assignment.** `@A(x = 1)` names an element of `A` and assigns nothing. It is a `FASTJavaElementValuePair`. v4 read it as an assignment, which made its value an expression, though an annotation is not one.
- **An element value is a constant.** javac's parser reads `@A(this)` and `@A(m())`, but JLS 9.7.1 requires a constant there and javac refuses both. The import refuses them too, with an error that names the rule.
- **A permits clause holds type names.** JLS 8.1.6 writes only names after `permits`, without type arguments or annotations.

## The same text, the same entity

v4 often chose an entity's class from where it stood. v5 reads the same text the same way everywhere.

**A dotted name is one entity.** JLS 6.5 leaves a dotted name ambiguous until it is resolved: in `com.foo.Bar.CONSTANT`, only name resolution can tell that `com.foo` is a package, `Bar` a type and `CONSTANT` a field. FAST-Java does not resolve names. v4 read a dotted name as a `FASTJavaQualifiedName` outside type declarations and as a `FASTJavaClassProperty` inside them. v5 reads it the same way everywhere, as a chain of `FASTJavaQualifiedName`:

```mermaid
flowchart LR
  constant[CONSTANT] -- namespace --> bar[Bar] -- namespace --> foo[foo] -- namespace --> com[com]
```

**`super` is an entity.** v4 read the keyword in four ways, v5 in one:

| Written | v4 | v5 |
|---|---|---|
| `super.go()` | an identifier named `super` | `FASTJavaSuper` |
| `super.f` | a variable named `super` | `FASTJavaSuper` |
| `super::go` | nothing at all | `FASTJavaSuper` |
| `T.super.go()` | a field access named `super` | `FASTJavaSuper`, qualified by `T` |

`this` is one entity in the same way, qualified or not.

**`var` is inferred only where Java infers it.** v4 read `var` as the inferred type wherever a type was written. JLS 14.4.1 and 15.27.1 infer it only for a local variable and a lambda parameter:

| Written | v5 reads `var` as |
|---|---|
| `var x = 1;` | the inferred type |
| `for (var s : list)` | the inferred type |
| `(var a) -> a` | the inferred type |
| `void m(var p)` | a type named `var` |

## What changes meaning, not how it is spelled

The model keeps what makes a program behave differently, and leaves style out.

- Parentheses are not modelled. The exporter writes back the ones that grouping needs, so `a - (b + c)` stays `a - (b + c)`.
- An enum constant records whether it has a body, even an empty one, because `A { }` makes the constant an instance of an anonymous class.
- A text block is a `FASTJavaTextBlock`. Its value is what stands between its two runs of three quotes, where v4 kept two of the quotes at each end.
- A pair of brackets is an entity, so `new int @A [3]` keeps `@A` on the pair the source writes it on.

## Checked like v4

v5.0.0 passes the same checks as v4.6.0:

- its whole test suite;
- every file of the JDK 8 and JDK 25 sources, 32,999 in all, imported, exported and compared with javac;
- the programs generated from the grammars of JLS SE 8, 17, 21 and 25, with the same results goal for goal.

The [first post](/posts/fast-java-jls-compliance/) explains these checks.

## Moving to v5

[MIGRATION.md](https://github.com/moosetechnology/FAST-JAVA/blob/v5.0.0/MIGRATION.md) has one section per change, each with a table of what to write instead. For example:

| v4 | v5 |
|---|---|
| `FASTJavaClassProperty` | `FASTJavaQualifiedName` |
| `aClassProperty fieldName` | `aQualifiedName name` |
| `aClassProperty type` | `aQualifiedName namespace` |

Two changes break silently, so look for them in your code:

- A type no longer has a `name`. Reading it answers `#noname` instead of raising, so look for its senders.
- `aModel allWithType: FASTJavaStringLiteral` no longer answers text blocks, which are a subclass now.

`FAST-Java-Deprecated` is gone with the major. Every method it held already named its replacement.

## How it was made

Like the compliance work, v5 was written with Claude, Anthropic's AI model. Claude wrote most of the code and the migration notes. I set the principles above and reviewed every change. The [first post](/posts/fast-java-jls-compliance/#how-we-worked) says more about how we worked.
