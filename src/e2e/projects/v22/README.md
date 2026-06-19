# Nx Angular Demo Workspace

This workspace is used for Angular auto-import and selector-resolution testing.

## Main projects

- `angular-demo`
- `angular-material-demo`
- `ng-zorro-demo`
- `primeng-demo`
- `taiga-demo`

## Useful commands

```bash
pnpm nx show projects
pnpm nx run-many -t build -p angular-demo,angular-material-demo,ng-zorro-demo,primeng-demo,taiga-demo --parallel=1
pnpm nx build angular-demo
pnpm nx build angular-material-demo
pnpm nx build ng-zorro-demo
pnpm nx build primeng-demo
pnpm nx build taiga-demo
```
