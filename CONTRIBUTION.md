# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change.

Before you make your changes, check to see if an [issue exists]() already for a change you want to make.

## Don't see your issue? Open on
If you spot something new, open an issue. I'll use the issue to have a conversation about the problem you want to fix.

### Ready to make a change? Fork the repo

Fork using GitHub Desktop:

- [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop) will guide you through setting up Desktop.
- Once Desktop is set up, you can use it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

Fork using the command line:

- [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a 
   build.
2. Update the README.md with details of changes to the interface, this includes new environment 
   variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this
   Pull Request would represent. The versioning scheme used in [SemVer](http://semver.org/).
4. You may merge the Pull Request in the owner has reviewed your pull request.

## Description of Folder structure and files
- `config`: Contains the key for database and passport secret.
- `Middleware`: contains the middle for check if the user is logged in or not (can add addition repetitive middleware).
- `Models`: contains the Schema for database.
- `public`: contains three folder:
  - `js`: contains the javascript files for all the pages
  - `css`: contains the styling files.
  - `assets`: contains the photo, video, gif etc.
- `Routes`: contains the controllers and the url of all the pages.
- `view`: contains the ejs(HTML markup) files.
- `server.js`: contains necessary setting, middleware and socket functions.
- `package.json`: contains the info as well as packages of the website.

## Keep Contributing as you use Face-Me.

