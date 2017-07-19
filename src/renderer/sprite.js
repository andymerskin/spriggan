import fs from 'fs-extra'
import path from 'path'
import spritesmith from 'spritesmith'
import templater from 'spritesheet-templates'
import {paramCase} from 'change-case'
import {remote} from 'electron'

const { tempDir } = remote.getGlobal('Spriggan')

function generate({images, bucket, outputFolder}) {
  const bucketName = bucket.name
  const outputFolderBucket = path.join(outputFolder, bucketName)
  const imageOutput = path.join(outputFolderBucket, 'sprite.png')
  const cssOutput = path.join(outputFolderBucket, 'sprite.css')

  fs.mkdirsSync(outputFolderBucket)

  console.log(images);

  return new Promise((resolve, reject) => {
    spritesmith.run({
      src: images.map(image => image.path)
    }, (err, result) => {
      if (err) {
        reject(err)
      }
      writeImage(result, imageOutput)
      writeCSS(result, images, cssOutput)
      resolve()
    })
  })
}

function writeImage(result, outputPath) {
  fs.writeFileSync(outputPath, result.image, 'binary')
}

function writeCSS(result, images, outputPath) {
  const {coordinates, properties} = result
  const existingNames = []


  const sprites = Object.keys(coordinates).sort().map(file => {
    let name = images.find(image => image.path === file).name
    const count = existingNames.filter(n => n === name).length
    const coords = coordinates[file]
    
    existingNames.push(name)

    if (count) {
      name = `${name}-${count}`
    }

    return {
      name,
      ...coords
    }
  })

  const spritesheet = {
    width: properties.width,
    height: properties.height,
    image: './sprite.png'
  }

  const cssStr = templater({
    sprites,
    spritesheet
  }, {
    format: 'css',
    formatOpts: {
      cssSelector(sprite) {
        return `.${sprite.name}`
      }
    }
  })

  fs.writeFileSync(outputPath, cssStr, 'utf8')
}

export default {
  generate
}