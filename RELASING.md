# Releasing

We use Changeset to manage versions acros the monorepo.

Steps make a new release:
1. Run `yarn changeset version`
2. Review and commit changes to `main` branch
3. Run `yarn changeset publish`
4. Push local `main` branch to `origin`
   