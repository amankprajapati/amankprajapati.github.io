# amankprajapati.github.io

Source for my research portfolio. Built with [Eleventy](https://www.11ty.dev/) and deployed to GitHub Pages by a GitHub Actions workflow on every push to `main`.

## Run locally

```bash
npm install
npm start        # dev server with live reload at http://localhost:8080
npm run build    # production build into _site/
```

Requires Node 18 or newer. The JavaScript is loaded as ES modules, so open the site through the dev server rather than by double clicking the built file.

## Where things live

```
src/
  index.njk                     page skeleton: masthead, section rail, sections, footer
  _data/                        content that is data, edited without touching markup
    site.json                   name, statement, research interests, contact links, section list
    experience.json             experience timeline and skills line
    awards.json                 awards, fellowships and academics
    grain.json                  per sensor readings and daily budgets for the grain figure
  _includes/
    layouts/base.njk            <head>, stylesheets, scripts
    partials/                   masthead, nav rail, footer, "read more" block, shared SVG markers
    sections/                   one file per page section
    entries/                    one file per publication, research or project entry
    details/                    long descriptions shown under experience and award items
    figures/                    one SVG file per figure
    icons/                      contact icons (Font Awesome Free, CC BY 4.0)
  assets/
    css/                        base, layout, masthead, entry, experience, video, figures, animations, responsive
    js/main.js                  entry point, imports the modules below
    js/modules/                 figure-observer, section-nav, video-embed, grain-fields, field-render, colormap
    img/                        portrait and figure images
```

## Common edits

- **Change text in the header, interests or contact links:** `src/_data/site.json`.
- **Add a job or internship:** add an item to the right group in `src/_data/experience.json`. For a long description, add `"details": "<name>"` and create `src/_includes/details/<name>.njk`.
- **Add a project:** create `src/_includes/entries/<name>.njk` (copy an existing entry), put its figure in `src/_includes/figures/<name>.svg`, and include the entry from `src/_includes/sections/projects.njk`.
- **Update the grain storage figure:** edit `src/_data/grain.json`. The fields are rendered in the browser from these values.

## Deployment

In the repository settings, under Pages, set **Source** to **GitHub Actions**. After that, every push to `main` builds and publishes the site.
