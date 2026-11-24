# samir.dev

Personal site: a retro desktop (sage + ink) built as a Jekyll site, with a blog.

## Write a post

1. Create `_posts/YYYY-MM-DD-my-post-name.md`:

   ```yaml
   ---
   layout: post
   title: My post title
   description: One sentence summary.
   tags: [python, backend]
   ---
   ```

2. Write Markdown below the front matter. Fenced code blocks are syntax highlighted.
3. Push. The post appears in the Writing window and at `/blog/my-post-name/`.

Unfinished posts go in `_drafts/` (no date in the file name) and show only with `--drafts`.
The feed is at `/blog/feed.xml`.

## Run locally

Needs Ruby 3.x. The macOS system Ruby (2.6) is too old.

```sh
bundle install
bundle exec jekyll serve --drafts   # http://localhost:4000
```

Or with Docker:

```sh
docker run --rm -p 4000:4000 -v "$PWD":/srv -w /srv ruby:3.3 \
  bash -c "bundle install && bundle exec jekyll serve --drafts --host 0.0.0.0"
```

## Deploy

GitHub Pages builds this directly (`github-pages` gem, plugins: feed, sitemap, seo-tag).
Copy the contents of this folder into the `thapasamir.github.io` repository and push.

## Where things are

- `index.html`: the desktop and all its windows
- `_includes/window.html`: window chrome; `_includes/menubar-desk.html`: menus
- `_layouts/`: `default` (shell) and `post`
- `css/style.css`, `js/desktop.js` (windows, menus, boot), `js/clock.js`
- `_config.yml`: title, URL, plugins
