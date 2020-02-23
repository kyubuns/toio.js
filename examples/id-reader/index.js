/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { NearestScanner } = require('@toio/scanner')

async function main() {
  // start a scanner to find the nearest cube
  const cube = await new NearestScanner().start()

  // connect to the cube
  await cube.connect()

  cube.setCollisionThreshold(1)

  // set listeners to show toio ID information
  cube
    .on('sensor:collision', data => console.log('[Collision]', data))
}

main()
