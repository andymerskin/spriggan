![logo.svg][1]

#### the Celtic sprite generator

> - Spriten your day.™
> - Spriten the load.™
> - Because, the future is sprite.™

Created with love at Markit Digital.

[Download Current Release](https://github.com/docmars/spriggan/releases/tag/0.1.0) · macOS

![spriggan.gif][2]

#### What's it do?
- Creates multiple image sprites in batches, in just a few clicks
- Supports entire folder structures of images
- Writes the sprite CSS
- Minifies sprite images to reduce the file size

#### Usage
1. Drag a few images (or a few folders of images) you want to create sprites out of.
2. or create new Buckets from scratch and add your images to them.
3. Click **Generate All**.
4. Sing a Gaelic tune! Each of your buckets have been turned into a sprite image (PNG) with its accompanying CSS your developers can use in their project.

#### What's a sprite?
A sprite is a map of images all compiled together so that developers don't have to include every individual image in their project separately, which causes slowdowns when a site or app loads. Loading just one image is quicker and more efficient.

#### Common use cases
- Icon libraries
- Button and component states (image-based)
- Logos
- Image bundles for advertisements

#### Contributors

``` bash
# install dependencies
yarn

# serve with hot reload at localhost:9080
yarn run dev

# build electron application for production
yarn run build

```

#### License

MIT

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).

[1]: https://github.com/docmars/spriggan/blob/master/resources/logo.png
[2]: https://github.com/docmars/spriggan/blob/master/resources/spriggan.gif
