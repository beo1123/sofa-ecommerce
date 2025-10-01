# Branch strategy

We follow a lightweight GitHub Flow / trunk-based approach.

## Branch naming

- feature/<short-name>
- fix/<short-name>
- hotfix/<short-name>
- release/<version>

## Workflow

1. Branch from `main`.
2. Implement feature/fix.
3. Open PR to `main`.
4. Ensure checks pass & get approvals.
5. Merge using **Squash and merge** (keeps main clean).
6. Rebase local branches before pushing to avoid conflicts.

## Merge vs Rebase

- Rebase locally to keep history linear.
- Use squash merges for PRs to keep changelog clean.
