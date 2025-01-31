# Releasing

We use Changeset to manage versions acros the monorepo.

Steps make a new release:

1. Run `yarn version`
2. Review and commit changes to `main` branch
3. Run `yarn publish`
4. Run `git push && git push --tag`
