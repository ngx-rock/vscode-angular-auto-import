[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / config/forms

# config/forms

Configuration for standard Angular forms directives.

Note: As of Angular 2024, form directives are NOT standalone.
They must be imported via FormsModule (template-driven) or
ReactiveFormsModule (reactive forms).

Important: The `selectors` array must include both bracketed and
non-bracketed variants for proper Trie-based prefix matching.

## Variables

### FORMS\_DIRECTIVES

> `const` **FORMS\_DIRECTIVES**: [`Element`](../types/angular.md#element)[]

Defined in: [config/forms.ts:19](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/forms.ts#L19)

Template-driven forms directives from FormsModule.
These directives are used for two-way data binding with [(ngModel)].

***

### REACTIVE\_FORMS\_DIRECTIVES

> `const` **REACTIVE\_FORMS\_DIRECTIVES**: [`Element`](../types/angular.md#element)[]

Defined in: [config/forms.ts:50](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/forms.ts#L50)

Reactive forms directives from ReactiveFormsModule.
These directives are used for model-driven forms with FormGroup and FormControl.
