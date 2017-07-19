import path from 'path'
import fs from 'fs-extra'
import {remote} from 'electron'
import imagemin from 'imagemin'
import optipng from 'imagemin-optipng'

const { tempDir } = remote.getGlobal('Spriggan')

const optipngOpts = {
  optimizationLevel: 4
}

export const minify = ({bucket, outputFolder}) => {
  return new Promise((resolve, reject) => {
    imagemin([path.join(outputFolder, bucket.name, '*.png')], path.join(outputFolder, bucket.name), {
      use: [ optipng(optipngOpts) ]
    })
    .then(resolve)
    .catch(err => {
      console.error('[Spriggan: minify]', err)
      throw new Error(err)
    })
  })
}

// .then(files => {
//   files.forEach(file => {
//     console.log(file);
//     const name = path.basename(file.path, '.png')
//     fs.writeFileSync(`${name}.min.png`, file.data, 'binary')
//   })
//   resolve()
// })