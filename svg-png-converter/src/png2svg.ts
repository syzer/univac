import { bitmap2vector } from 'bitmap2vector'
import { isNode } from 'misc-utils-of-mine-generic'
import { isBase64, urlToBase64 } from "./base64"
import { blobToBuffer, BufferClass, typedArrayToBuffer } from './buffer'
import { optimizeSvg } from './optimizeSvg'
import { potracePosterize } from './potrace'
import { PNG2SVGOptions, PotraceTraceOptions } from './types'

/**
 * Converts a PNG bitmap image to a SVG vector graphics. Other input supported besides PNG/SVG are JPEG and
 * BMP. Notice that the output SVG won't respect image colors and only will be monochrome. If no --color
 * parameter is given it will produce a black-white (background transparent) image. 
 */
export async function png2svg(options: PNG2SVGOptions) {
  try {
    let buffer = await resolveInput(options)
    let result: { content: string } | undefined
    if (!options.tracer || options.tracer === 'potrace') {
      result = await dispatchPotrace(options, buffer)
    }
    else {
      result = await bitmap2vector({ ...options, input: buffer })
    }
    result.content = await dispatchOptimizeSvg(options, result.content)
    return result
  }
  catch (error) {
    console.error('ERROR PngToSvg', error, (error as Error).stack)
    throw error
  }
}

async function dispatchPotrace(options: PNG2SVGOptions, buffer: Buffer) {
  if (options.fillStrategy === 'none') {
    options.fillStrategy = true as any
  }
  if (typeof options.steps === 'string' && (options.steps as any).includes(',')) {
    console.log((options.steps as any).split(','), (options.steps as string).split(',').map(e => parseInt(e)))
    options.steps = (options.steps as string).split(',').map(e => parseInt(e))
  }
  (options as PotraceTraceOptions).optCurve = options.noCurveOptimization !== false
  options.debug && console.log(`Options: ${JSON.stringify({ ...options, input: null })}`)
  return {
    content: await potracePosterize(buffer, options)
  }
}

async function resolveInput(options: PNG2SVGOptions) {
  let buffer: Buffer | undefined
  if (BufferClass.isBuffer(options.input)) {
    buffer = options.input
  }
  else if (!isNode() && typeof Blob !== 'undefined' && options.input instanceof Blob) {
    buffer = await blobToBuffer(options.input)
  }
  else if (typeof options.input === 'string' && options.input.startsWith('data:')) {
    buffer = BufferClass.from(urlToBase64(options.input), 'base64')
  }
  else if (typeof options.input === 'string' && isBase64(options.input)) {
    buffer = BufferClass.from(Base64.atob(options.input), 'binary')
  }
  else if (typeof options.input === 'string') {
    buffer = BufferClass.from(options.input, 'binary')
  }
  else if (options.input instanceof Uint8Array && !BufferClass.isBuffer(options.input)) {
    buffer = typedArrayToBuffer(options.input)
  }
  if (!buffer) {
    throw new Error('Invalid input option, must be one of Buffer|Uint8Array|Blob|data-url string|binary string')
  }
  return buffer
}

async function dispatchOptimizeSvg(options: PNG2SVGOptions, data: string) {
  if (!options.optimize) {
    return data
  }
  const result = await optimizeSvg(data, options.debug)
  return result
}


