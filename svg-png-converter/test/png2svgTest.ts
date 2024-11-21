import test from 'ava'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import {sleep, tryTo} from 'misc-utils-of-mine-generic'
import { base64ToUrl } from "../src/base64"
import { png2svg } from '../src/png2svg'

test('should render svg form png and jpeg buffer', async t => {
  tryTo(() => {
    unlinkSync('tmp31.svg')
    unlinkSync('tmp32.svg')
  })
  t.false(existsSync('tmp31.svg'))
  t.false(existsSync('tmp32.svg'))
  const png = await png2svg({ input: readFileSync('test/assets/tmp2.png') });
  const jpeg = await png2svg({ input: readFileSync('test/assets/tmp2.jpeg') });
  writeFileSync("tmp31.svg", png.content)
  writeFileSync("tmp32.svg", jpeg.content)
  t.true(existsSync('tmp31.svg'))
  t.true(existsSync('tmp32.svg'))
})

test('should render svg form png and jpeg binary strings', async t => {
  tryTo(() => {
    unlinkSync('tmp41.svg')
    unlinkSync('tmp42.svg')
  })
  t.false(existsSync('tmp41.svg'))
  t.false(existsSync('tmp42.svg'))
  const png = await png2svg({ input: readFileSync('test/assets/tmp2.png').toString('binary') })
  const jpeg = await png2svg({ input: readFileSync('test/assets/tmp2.jpeg').toString('binary') })
  writeFileSync("tmp41.svg", png.content)
  writeFileSync("tmp42.svg", jpeg.content)
  t.true(existsSync('tmp41.svg'))
  t.true(existsSync('tmp42.svg'))
})

test('should render svg from png and jpeg base64 strings', async t => {
  tryTo(() => {
    unlinkSync('tmp51.svg')
    unlinkSync('tmp52.svg')
  })
  t.false(existsSync('tmp51.svg'))
  t.false(existsSync('tmp52.svg'))

  const png = await png2svg({ input: readFileSync('test/assets/tmp2.png').toString('base64') })
  const jpeg = await png2svg({ input: readFileSync('test/assets/tmp2.jpeg').toString('base64') })

  writeFileSync("tmp51.svg", png.content)
  writeFileSync("tmp52.svg", jpeg.content)
  t.true(existsSync('tmp51.svg'))
  t.true(existsSync('tmp52.svg'))
})

test('should render svg from png and jpeg data URL', async t => {
  tryTo(() => {
    unlinkSync('tmp61.svg')
    unlinkSync('tmp62.svg')
  })
  t.false(existsSync('tmp61.svg'))
  t.false(existsSync('tmp62.svg'))
  const png = await png2svg({ input: base64ToUrl(readFileSync('test/assets/tmp2.png').toString('base64'), 'image/png' )})
  const jpeg = await png2svg({ input: base64ToUrl(readFileSync('test/assets/tmp2.jpeg').toString('base64'), 'image/jpeg' )})
  writeFileSync("tmp61.svg", png.content)
  writeFileSync("tmp62.svg", jpeg.content)

  await sleep(100)
  t.true(existsSync('tmp61.svg'))
  t.true(existsSync('tmp62.svg'))
})

test.todo('Blob')
test.todo('UInt8Array')
