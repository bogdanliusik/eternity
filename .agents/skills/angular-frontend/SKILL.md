---
name: angular-frontend
description: Follow the repo's Angular frontend patterns. Use when changing routes, components, stores, forms, services, shared UI, or real-time client flows.
---

# Angular Frontend Patterns

## File and naming conventions

- Components: `kebab-case.ts` (no `.component` suffix). Class: `PascalCase` (no `Component` suffix). Selector: `app-kebab-case`.
- Stores: `kebab-case.store.ts`. Exported as `const XxxStore = signalStore(...)`.
- Services: `kebab-case.service.ts`. Class: `XxxService`.
- Models: `kebab-case.model.ts`. Interfaces and enums.
- Guards/interceptors: exported as functions, not classes.
- Path alias: `@/` maps to `src/app/`.

## Where things go

- `core/` -- app-wide singletons: auth (`auth.store.ts`, `auth.service.ts`, `auth.guard.ts`, `auth.interceptor.ts`), theme, HTTP (`CoreHttpService`), SignalR (`SignalRService`, hub services), PeerJS client.
- `shared/` -- reusable standalone components and directives (e.g. `multiselect/`, `tabbed-list/`, `click-outside.directive.ts`).
- `features/` -- screen-level pages with co-located `components/`, `models/`, `services/`, `store/` subdirectories.

## Component pattern

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './example.html',
  host: { class: 'block' },
  imports: [/* ... */],
  providers: [ExampleStore], // feature stores provided here
})
export class Example {
  readonly store = inject(ExampleStore);
}
```

## Signal Store pattern

```typescript
export const ExampleStore = signalStore(
  // { providedIn: 'root' } for global stores, omit for feature stores
  withState(initialState),
  withComputed((store) => ({
    derived: computed(() => store.items().length),
  })),
  withMethods((store, service = inject(ExampleService)) => ({
    load: rxMethod<void>(pipe(
      tap(() => patchState(store, { isLoading: true })),
      switchMap(() => service.getAll().pipe(
        tapResponse({
          next: (data) => patchState(store, { data, isLoading: false }),
          error: () => patchState(store, { isLoading: false }),
        })
      ))
    )),
  }))
);
```

## HTTP and error handling

- All HTTP goes through `CoreHttpService` which wraps `HttpClient`.
- Responses are `ApiEnvelope<T>` (`{ succeeded, errors, data }`). `CoreHttpService` unwraps or throws `ApiError`.
- `authInterceptor` catches 401 on non-auth endpoints and triggers logout.
- In stores, always handle errors via `tapResponse` -- never let them bubble.

## Routes

- Centralized in `src/app/app.routes.ts`.
- Authenticated routes live under the `Layout` shell with `canActivate: [authenticationGuard]`.
- All feature pages lazy-load: `loadComponent: () => import('./features/example/example').then(m => m.Example)`.

## Real-time

- `SignalRService` manages hub connections with auto-reconnect.
- Hub-specific services (`GeneralHubService`, `CallHubService`) wrap it with typed event observables and invoke methods.
- Never create ad-hoc `HubConnection` instances in features.

## Avoid

- Angular Material.
- Feature code in `core/`.
- Scattered component state when a store fits.
- New `any` types when a precise type is practical.
- Weakening ESLint rules to suppress warnings.
