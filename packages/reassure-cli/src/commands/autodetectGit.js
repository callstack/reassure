(async function () {
  let branch = null;
  let commitHash = null;
  const simpleGit = require('simple-git');
  console.log('Trying to detect version control data');
  const git = simpleGit({ baseDir: process.cwd() });
  git
    .revparse(['--abbrev-ref', 'HEAD'])
    .then((ob) => {
      branch = ob;
      process.send({ branch });
    })
    .catch((reason) => {
      console.log('Error fetching branch ', reason);
    });
  git
    .revparse(['HEAD'])
    .then((ob) => {
      commitHash = ob;
      process.send({ commitHash });
    })
    .catch((reason) => {
      console.log('Error fetching commitHash ', reason);
    });
})();
